import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset, random_split
from torchvision import transforms, datasets
import os
import random
from PIL import Image

# Configuration
# User can adjust epochs here
EPOCHS = 10
BATCH_SIZE = 32
LEARNING_RATE = 0.001

# Paths to the datasets
PLANT_DIR = "/Users/ericmin/Downloads/plantwild_v2"
TREE_DIR = "/Users/ericmin/Downloads/tree"
NON_PLANT_DIR = "/Users/ericmin/Downloads/dataset"
MODEL_SAVE_PATH = "models/plant_classifier.pth"

# Custom Dataset to handle two separate directories
class BinaryDataset(Dataset):
    def __init__(self, plant_dir, tree_dir, non_plant_dir, transform=None):
        self.plant_dir = plant_dir
        self.tree_dir = tree_dir
        self.non_plant_dir = non_plant_dir
        self.transform = transform
        self.image_paths = []
        self.labels = [] # 0 for non-plant, 1 for plant

        # Helper to recursively find images
        def find_images_recursive(directory):
            paths = []
            if os.path.exists(directory):
                for root, _, files in os.walk(directory):
                    for filename in files:
                        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif')):
                            paths.append(os.path.join(root, filename))
            return paths

        # 1. Collect Non-Plant images (Label 0)
        non_plant_paths = find_images_recursive(non_plant_dir)
        if not os.path.exists(non_plant_dir):
            print(f"⚠️ Warning: Non-plant directory not found: {non_plant_dir}")

        num_non_plants = len(non_plant_paths)
        print(f"   Found {num_non_plants} non-plant images.")

        # 2. Collect Plant images (Label 1)
        plant_paths = find_images_recursive(plant_dir)
        if not os.path.exists(plant_dir):
            print(f"⚠️ Warning: Plant directory not found: {plant_dir}")

        # ADDED: Collect Tree images (Label 1)
        tree_paths = find_images_recursive(tree_dir)
        if not os.path.exists(tree_dir):
            print(f"⚠️ Warning: Tree directory not found: {tree_dir}")
        else:
            print(f"   Found {len(tree_paths)} tree images.")
            plant_paths.extend(tree_paths)

        # ADDED: Include extra local plant images (e.g., invasive2.png)
        extra_plant_dir = "extra_plants"
        if os.path.exists(extra_plant_dir):
            extra_paths = find_images_recursive(extra_plant_dir)
            print(f"   Found {len(extra_paths)} extra plant images in {extra_plant_dir}")
            # Add them multiple times to ensure they are learned (Oversampling)
            for _ in range(50): 
                plant_paths.extend(extra_paths)
        
        num_plants_found = len(plant_paths)
        print(f"   Found {num_plants_found} plant images (Plants + Trees + Extras).")

        # 3. Balance Datasets
        # We want to use ALL available plant/tree images as requested.
        # We will NOT downsample plants even if they outnumber non-plants.
        if num_non_plants > 0 and num_plants_found > num_non_plants:
            print(f"ℹ️  Keeping all {num_plants_found} plant images (Plants > Non-Plants).")
            # previously: plant_paths = random.sample(plant_paths, num_non_plants)
        elif num_plants_found == 0:
            print("⚠️ Warning: No plant images found.")
        elif num_non_plants == 0:
            print("⚠️ Warning: No non-plant images found.")

        # 4. Combine
        for p in non_plant_paths:
            self.image_paths.append(p)
            self.labels.append(0)
        
        for p in plant_paths:
            self.image_paths.append(p)
            self.labels.append(1)

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        label = self.labels[idx]
        
        try:
            image = Image.open(img_path).convert("RGB")
            if self.transform:
                image = self.transform(image)
            return image, label
        except Exception as e:
            print(f"Error loading image {img_path}: {e}")
            # Return a dummy image or handle error appropriately
            # For simplicity, we'll return the next item (recursive) or a black image
            # Ideally, filter broken images beforehand
            return torch.zeros((1, 28, 28)), label

# RESTORED USER'S CNN ARCHITECTURE
# Fixing 'def' to 'class' for validity, but keeping structure identical
class PlantCNN(nn.Module):
    def __init__(self):
        super().__init__()
        # UPDATED: 3 input channels (RGB), larger input support
        self.conv1 = nn.Conv2d(3, 6, 3, 1) # 3 inputs (RGB) to 6, 3x3 window, stride 1
        self.conv2 = nn.Conv2d(6, 16, 3, 1) # 6 inputs to 16, 3x3 window, stride 1
        
        # Calculation for 64x64 input:
        # Conv1: (64-3+1) = 62x62 -> Pool: 31x31
        # Conv2: (31-3+1) = 29x29 -> Pool: 14x14
        # Flatten: 16 * 14 * 14 = 3136
        self.fc1 = nn.Linear(16 * 14 * 14, 120) 
        self.fc2 = nn.Linear(120, 67) # Changed to 67 neurons as requested
        self.fc3 = nn.Linear(67, 2)
        
        # Dropout regularization
        self.dropout = nn.Dropout(0.5)
    
    def forward(self, X):
        X = F.relu(self.conv1(X))
        X = F.max_pool2d(X, 2, 2)
        X = F.relu(self.conv2(X))
        X = F.max_pool2d(X, 2, 2)
        X = X.view(-1, 16 * 14 * 14) # Flatten based on new dimensions
        X = F.relu(self.fc1(X))
        X = self.dropout(X) # Apply dropout
        X = F.relu(self.fc2(X))
        X = self.dropout(X) # Apply dropout
        X = self.fc3(X)
        return X

def train():
    print("🚀 Starting training setup...")

    # 1. Define Transforms
    # MUST match the input size expected by PlantCNN (64x64, RGB)
    # ADDED: Data Augmentation to help with distracting backgrounds and color variations
    transform = transforms.Compose([
        transforms.Resize((64, 64)), # Increased resolution
        transforms.RandomHorizontalFlip(), # Randomly flip horizontally
        transforms.RandomRotation(15), # Randomly rotate +/- 15 degrees
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1), # Randomly change colors
        transforms.ToTensor(),
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)) # Normalize RGB images
    ])

    # 2. Load Data
    print(f"📂 Loading data from:")
    print(f"   Plants: {PLANT_DIR}")
    print(f"   Trees: {TREE_DIR}")
    print(f"   Non-Plants: {NON_PLANT_DIR}")

    # 3. Create Dataset and Dataloaders
    # Now we pass TREE_DIR as well
    dataset = BinaryDataset(PLANT_DIR, TREE_DIR, NON_PLANT_DIR, transform=transform)
    
    if len(dataset) == 0:
        print("❌ No images found. Exiting.")
        return

    print(f"✅ Found {len(dataset)} total images.")
    
    # 80% train, 20% validation
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_dataset, val_dataset = random_split(dataset, [train_size, val_size])
    
    print(f"   - Training Set: {len(train_dataset)} images")
    print(f"   - Validation Set: {len(val_dataset)} images")

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    # 3. Initialize Model
    if torch.backends.mps.is_available():
        device = torch.device("mps")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
    else:
        device = torch.device("cpu")
    print(f"💻 Using device: {device}")
    
    # Use the local PlantCNN class
    model = PlantCNN().to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    # 4. Training Loop
    print(f"params: {sum(p.numel() for p in model.parameters())} trainable parameters")
    print("Starting training loop...")
    
    best_val_acc = 0.0

    for epoch in range(EPOCHS):
        # Training Phase
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for i, data in enumerate(train_loader, 0):
            inputs, labels = data
            inputs, labels = inputs.to(device), labels.to(device)

            optimizer.zero_grad()

            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            
            # Calculate accuracy
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

        train_loss = running_loss / len(train_loader)
        train_acc = 100 * correct / total

        # Validation Phase
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for data in val_loader:
                inputs, labels = data
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, predicted = torch.max(outputs.data, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
        
        val_acc = 100 * val_correct / val_total
        
        print(f"Epoch {epoch + 1}/{EPOCHS} | Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}% | Val Acc: {val_acc:.2f}%")

        # Save Best Model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            try:
                os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
                torch.save(model.state_dict(), MODEL_SAVE_PATH)
                # print(f"   💾 New best model saved! (Val Acc: {val_acc:.2f}%)")
            except Exception as e:
                print(f"❌ Error saving model: {e}")

    print(f"✅ Finished Training. Best Validation Accuracy: {best_val_acc:.2f}%")
    print(f"💾 Final best model saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train()

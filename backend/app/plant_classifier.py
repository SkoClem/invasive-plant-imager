import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from PIL import Image
import io
import os

# 1. Define your CNN Architecture
class PlantClassifier(nn.Module):
    def __init__(self):
        super(PlantClassifier, self).__init__()
        # UPDATED: 3 input channels (RGB), larger input support
        self.conv1 = nn.Conv2d(3, 6, 3, 1) # 3 inputs (RGB) to 6, 3x3 window, stride 1
        self.conv2 = nn.Conv2d(6, 16, 3, 1) # 6 inputs to 16, 3x3 window, stride 1
        
        # Calculation for 64x64 input:
        # Conv1: (64-3+1) = 62x62 -> Pool: 31x31
        # Conv2: (31-3+1) = 29x29 -> Pool: 14x14
        # Flatten: 16 * 14 * 14 = 3136
        self.fc1 = nn.Linear(16 * 14 * 14, 120) 
        self.fc2 = nn.Linear(120, 84) # Standardized to match training
        self.fc3 = nn.Linear(84, 2)
        
        # Dropout regularization (needed to load state_dict even if not used in eval)
        self.dropout = nn.Dropout(0.5)

    def forward(self, X):
        # Conv1 -> ReLU -> MaxPool
        X = F.relu(self.conv1(X))
        X = F.max_pool2d(X, 2, 2) # 62x62 -> 31x31
        
        # Conv2 -> ReLU -> MaxPool
        X = F.relu(self.conv2(X))
        X = F.max_pool2d(X, 2, 2) # 29x29 -> 14x14
        
        # Flatten
        X = X.view(-1, 16 * 14 * 14) # 3136
        
        # FC Layers with Dropout
        X = F.relu(self.fc1(X))
        X = self.dropout(X) # Dropout
        X = F.relu(self.fc2(X))
        X = self.dropout(X) # Dropout
        X = self.fc3(X)
        return X

# Global instance
model = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model(model_path="models/plant_classifier.pth"):
    """
    Loads the trained model weights.
    Call this on application startup.
    """
    global model
    try:
        # Check if we are running from backend directory or root
        if not os.path.exists(model_path):
            # Try absolute path based on current file location
            current_dir = os.path.dirname(os.path.abspath(__file__))
            # app/ -> backend/ -> models/
            alt_path = os.path.join(current_dir, "..", "models", "plant_classifier.pth")
            if os.path.exists(alt_path):
                model_path = alt_path

        model = PlantClassifier()
        if os.path.exists(model_path):
            model.load_state_dict(torch.load(model_path, map_location=device))
            model.to(device)
            model.eval()
            print(f"✅ Plant Classifier loaded from {model_path}")
        else:
            print(f"⚠️ Warning: Model file not found at {model_path}. Classifier will not work.")
            model = None
    except Exception as e:
        print(f"❌ Failed to load Plant Classifier: {e}")
        model = None

def is_plant(image_bytes: bytes) -> bool:
    """
    Takes raw image bytes, preprocesses them, and runs inference.
    Returns True if the image is a plant, False otherwise.
    """
    if model is None:
        print("⚠️ Model not loaded, skipping plant detection (defaulting to True)")
        return True # Fail open if model is missing

    try:
        # 1. Preprocess the image
        # MUST match the training transforms: RGB, 64x64
        transform = transforms.Compose([
            # transforms.Grayscale(num_output_channels=1), # Removed
            transforms.Resize((64, 64)),
            transforms.ToTensor(),
            # Normalization matching the training data (RGB)
            transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)) 
        ])
        
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB") # Ensure RGB
        image_tensor = transform(image).unsqueeze(0).to(device) # Add batch dimension

        # 2. Run Inference
        with torch.no_grad():
            outputs = model(image_tensor)
            # Output is [score_class_0, score_class_1]
            # We need to know which class index corresponds to "Plant".
            # Typically ImageFolder sorts alphabetically.
            # If folders are "not_plant" and "plant":
            # 0: not_plant
            # 1: plant
            
            _, predicted = torch.max(outputs, 1)
            predicted_class = predicted.item()
            
            # Assuming class 1 is Plant (based on alphabetical 'not_plant' vs 'plant')
            # If user uses different folder names, this needs adjustment.
            # For now, we assume 1 = Plant.
            return predicted_class == 1 
            
    except Exception as e:
        print(f"Error during plant detection: {e}")
        return True # Fail open on error

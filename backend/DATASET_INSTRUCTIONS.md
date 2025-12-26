# Plant Classifier Dataset Instructions

To train the plant classifier, you need to provide a dataset of images.

## 1. Directory Structure

Create a `dataset` folder inside the `backend` directory.
Inside `dataset`, create two subfolders: `plant` and `not_plant`.

```
backend/
├── dataset/
│   ├── plant/      <-- Put images of plants here
│   └── not_plant/  <-- Put images of random objects here
```

## 2. Image Format

-   Images can be in standard formats like `.jpg`, `.jpeg`, `.png`.
-   The training script handles resizing (to 28x28) and grayscaling automatically.
-   Aim for a balanced dataset (roughly equal number of images in both folders) for best results.

## 3. Training the Model

Once your images are in place, run the training script from the `backend` directory:

```bash
python train_model.py
```

This will:
1.  Load images from `backend/dataset`.
2.  Train the CNN for the specified number of epochs (default 10).
3.  Save the trained model to `backend/models/plant_classifier.pth`.

## 4. Automatic Integration

The backend is already configured to use `models/plant_classifier.pth` if it exists.
-   On startup, the API tries to load this model.
-   When an image is uploaded to `/api/analyze-plant`, it is first checked by this classifier.
-   If it's NOT a plant, the API returns immediately without calling the expensive LLM service.
-   If the model file is missing, the check is skipped (fails open), so the app continues to work (but without filtering).

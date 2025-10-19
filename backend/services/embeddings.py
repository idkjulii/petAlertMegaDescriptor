# backend/services/embeddings.py
import io
from typing import Optional
import numpy as np
from PIL import Image
import torch
import open_clip

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_NAME = "ViT-B-32"
PRETRAINED = "laion2b_s34b_b79k"

_model = None
_preprocess = None

def _load_model():
    global _model, _preprocess
    if _model is None:
        _model, _, _preprocess = open_clip.create_model_and_transforms(
            MODEL_NAME, pretrained=PRETRAINED, device=DEVICE
        )
        _model.eval()
    return _model, _preprocess

def image_bytes_to_vec(image_bytes: bytes) -> np.ndarray:
    """Devuelve embedding L2-normalizado float32[512] para OpenCLIP ViT-B/32."""
    model, preprocess = _load_model()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    with torch.inference_mode():
        im = preprocess(img).unsqueeze(0).to(DEVICE)
        feats = model.encode_image(im)
        feats = feats / feats.norm(dim=-1, keepdim=True)
    vec = feats.squeeze(0).detach().cpu().numpy().astype("float32")
    if vec.shape[-1] != 512:
        raise RuntimeError(f"embedding dim {vec.shape[-1]} != 512")
    return vec

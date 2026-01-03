import shutil
import os
from fastapi import UploadFile
from sqlalchemy.orm import Session
from documents.models import Document

UPLOAD_DIR = "shared_data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload_file(upload_file: UploadFile, user_id: int, db: Session) -> Document:
    file_location = f"{UPLOAD_DIR}/{user_id}_{upload_file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(upload_file.file, file_object)
    
    db_document = Document(
        filename=upload_file.filename,
        file_path=file_location,
        user_id=user_id
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

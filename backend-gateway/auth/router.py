from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from database.db import get_db
from auth.models import User
from auth.auth_service import verify_password, get_password_hash, create_access_token, get_current_user, create_refresh_token, verify_token
from pydantic import BaseModel
from typing import Optional, Generic, TypeVar, Any
from sqlalchemy import or_

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

class UserCreate(BaseModel):
    username: str
    email: str
    phone_number: str
    password: str
    name: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str = "User" # Defaulting to User as role is not in DB model yet

    class Config:
        orm_mode = True

class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    refresh_token: str

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class ResetPasswordRequest(BaseModel):
    username: str

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register", response_model=APIResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if any identifier already exists
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.phone_number == user.phone_number).first():
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        phone_number=user.phone_number,
        full_name=user.name,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.username})
    refresh_token = create_refresh_token(data={"sub": new_user.username})
    
    # Create UserResponse object
    user_response = UserResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        full_name=new_user.full_name
    )
    
    return APIResponse(
        success=True,
        message="Registration successful",
        data=AuthResponse(user=user_response, token=access_token, refresh_token=refresh_token)
    )

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # form_data.username can be username, email, or phone
    login_identifier = form_data.username
    user = db.query(User).filter(
        or_(
            User.username == login_identifier,
            User.email == login_identifier,
            User.phone_number == login_identifier
        )
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email/phone or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=APIResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # request.username can be username, email, or phone
    login_identifier = request.username
    user = db.query(User).filter(
        or_(
            User.username == login_identifier,
            User.email == login_identifier,
            User.phone_number == login_identifier
        )
    ).first()
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email/phone or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    # Create UserResponse object
    user_response = UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name
    )
    
    return APIResponse(
        success=True,
        message="Login successful",
        data=AuthResponse(user=user_response, token=access_token, refresh_token=refresh_token)
    )

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=APIResponse)
def refresh_token(request: RefreshRequest, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    username = verify_token(request.refresh_token, credentials_exception)
    user = db.query(User).filter(User.username == username).first()
    
    if user is None:
        raise credentials_exception
        
    access_token = create_access_token(data={"sub": user.username})
    # Optionally rotate refresh token here
    
    return APIResponse(
        success=True,
        message="Token refreshed",
        data={"access_token": access_token, "token_type": "bearer"}
    )

@router.get("/me", response_model=APIResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    user_response = UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name
    )
    return APIResponse(
        success=True,
        message="User profile retrieved",
        data=user_response
    )

@router.post("/change-password")
def change_password(request: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(request.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    current_user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = get_password_hash("test@123")
    db.commit()
    return {"message": "Password reset to test@123"}

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None

@router.put("/profile", response_model=APIResponse)
def update_profile(update_data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if update_data.full_name:
        current_user.full_name = update_data.full_name
    if update_data.email:
        # Check if email is taken by another user
        existing = db.query(User).filter(User.email == update_data.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = update_data.email
    
    db.commit()
    db.refresh(current_user)
    
    user_response = UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name
    )
    
    return APIResponse(
        success=True,
        message="Profile updated successfully",
        data={"user": user_response}
    )

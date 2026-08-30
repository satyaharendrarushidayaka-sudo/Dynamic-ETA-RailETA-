from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/")
def get_stations(db: Session = Depends(get_db)):
    stations = db.query(models.Station).all()
    return stations

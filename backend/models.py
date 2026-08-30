from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base

class Train(Base):
    __tablename__ = "trains"
    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String, index=True)
    train_name = Column(String)
    origin = Column(String)
    destination = Column(String)
    type = Column(String)
    
    routes = relationship("Route", back_populates="train")

class Station(Base):
    __tablename__ = "stations"
    id = Column(Integer, primary_key=True, index=True)
    station_code = Column(String, index=True)
    station_name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)

class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"))
    station_id = Column(Integer, ForeignKey("stations.id"))
    stop_number = Column(Integer)
    distance_from_origin = Column(Float)
    scheduled_arrival = Column(String, nullable=True)
    scheduled_departure = Column(String, nullable=True)
    halt_duration = Column(Integer)
    
    train = relationship("Train", back_populates="routes")
    station = relationship("Station")

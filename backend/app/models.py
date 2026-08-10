from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database import Base


class Ticket(Base):

    __tablename__ = "tickets"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    ticket_id = Column(
        String,
        unique=True,
        nullable=False
    )

    customer_name = Column(
        String,
        nullable=False
    )

    customer_email = Column(
        String,
        nullable=False
    )

    subject = Column(
        String,
        nullable=False
    )

    description = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="Open"
    )

    notes = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
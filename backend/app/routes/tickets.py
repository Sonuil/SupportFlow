from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import SessionLocal
from app import crud, schemas


router = APIRouter(
    prefix="/api/tickets",
    tags=["Tickets"]
)


# ========================================
# DATABASE DEPENDENCY
# ========================================

def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ========================================
# GET ALL TICKETS
# ========================================

@router.get("/", response_model=List[schemas.TicketResponse])
def get_all_tickets(
    db: Session = Depends(get_db)
):

    return crud.get_all_tickets(db)


# ========================================
# GET SINGLE TICKET
# ========================================

@router.get("/{ticket_id}", response_model=schemas.TicketResponse)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db)
):

    ticket = crud.get_ticket(db, ticket_id)

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket


# ========================================
# CREATE TICKET
# ========================================

@router.post(
    "/",
    response_model=schemas.TicketResponse
)
def create_ticket(
    ticket: schemas.TicketCreate,
    db: Session = Depends(get_db)
):

    return crud.create_ticket(db, ticket)


# ========================================
# UPDATE TICKET
# ========================================

@router.put(
    "/{ticket_id}",
    response_model=schemas.TicketResponse
)
def update_ticket(
    ticket_id: int,
    ticket: schemas.TicketUpdate,
    db: Session = Depends(get_db)
):

    updated_ticket = crud.update_ticket(
        db,
        ticket_id,
        ticket
    )

    if updated_ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return updated_ticket
from sqlalchemy.orm import Session
from app import models, schemas
from app.utils.ticket_generator import generate_ticket_id


# ========================================
# CREATE TICKET
# ========================================

def create_ticket(db: Session, ticket: schemas.TicketCreate):

    new_ticket = models.Ticket(
        ticket_id=generate_ticket_id(db),
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        description=ticket.description,
        status="Open",
        notes=None
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return new_ticket


# ========================================
# GET ALL TICKETS
# ========================================

def get_all_tickets(db: Session):

    return db.query(models.Ticket).order_by(
        models.Ticket.id.desc()
    ).all()


# ========================================
# GET SINGLE TICKET
# ========================================

def get_ticket(db: Session, ticket_id: int):

    return db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()


# ========================================
# UPDATE TICKET
# ========================================

def update_ticket(
    db: Session,
    ticket_id: int,
    ticket: schemas.TicketUpdate
):

    existing_ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if existing_ticket is None:
        return None

    # Update status
    if ticket.status is not None:
        existing_ticket.status = ticket.status

    # Update support notes
    if ticket.notes is not None:
        existing_ticket.notes = ticket.notes

    db.commit()
    db.refresh(existing_ticket)

    return existing_ticket
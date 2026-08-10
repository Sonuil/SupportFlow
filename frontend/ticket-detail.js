const API_URL = "http://127.0.0.1:8000/api/tickets";

let ticketId = null;


/* =========================
   GET TICKET ID FROM URL
========================= */

function getTicketId() {

    const params = new URLSearchParams(
        window.location.search
    );

    return params.get("id");
}


/* =========================
   FORMAT DATE
========================= */

function formatDate(dateString) {

    if (!dateString) {
        return "N/A";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return "N/A";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================
   SHOW ERROR
========================= */

function showError(message) {

    document.getElementById("loading").style.display = "none";

    const errorBox =
        document.getElementById("error-message");

    errorBox.textContent = message;

    errorBox.style.display = "block";
}


/* =========================
   SET STATUS STYLE
========================= */

function setStatusStyle(status) {

    const statusElement =
        document.getElementById("ticket-status");

    statusElement.textContent = status;

    statusElement.className = "status-badge";


    if (status === "Open") {

        statusElement.classList.add(
            "status-open"
        );

    }


    else if (status === "In Progress") {

        statusElement.classList.add(
            "status-progress"
        );

    }


    else if (status === "Closed") {

        statusElement.classList.add(
            "status-closed"
        );

    }

}


/* =========================
   LOAD TICKET
========================= */

async function loadTicket() {

    ticketId = getTicketId();


    if (!ticketId) {

        showError(
            "Ticket ID was not provided."
        );

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${ticketId}`
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load ticket."
            );

        }


        const ticket =
            await response.json();


        /* Ticket ID */

        document.getElementById(
            "ticket-id"
        ).textContent =
            ticket.ticket_id ||
            `TKT-${String(ticket.id).padStart(3, "0")}`;


        /* Subject */

        document.getElementById(
            "ticket-subject"
        ).textContent =
            ticket.subject || "No subject";


        /* Customer */

        document.getElementById(
            "customer-name"
        ).textContent =
            ticket.customer_name || "N/A";


        /* Email */

        document.getElementById(
            "customer-email"
        ).textContent =
            ticket.customer_email || "N/A";


        /* Subject */

        document.getElementById(
            "subject"
        ).textContent =
            ticket.subject || "N/A";


        /* Description */

        document.getElementById(
            "description"
        ).textContent =
            ticket.description || "N/A";


        /* Status */

        document.getElementById(
            "details-status"
        ).textContent =
            ticket.status || "N/A";


        /* Notes */

        document.getElementById(
            "support-notes"
        ).textContent =
            ticket.notes ||
            "No notes added yet.";


        /* Created */

        document.getElementById(
            "created-at"
        ).textContent =
            formatDate(ticket.created_at);


        /* Updated */

        document.getElementById(
            "updated-at"
        ).textContent =
            formatDate(ticket.updated_at);


        /* Status badge */

        setStatusStyle(
            ticket.status
        );


        /* Update form */

        document.getElementById(
            "status"
        ).value =
            ticket.status || "Open";


        document.getElementById(
            "notes"
        ).value =
            ticket.notes || "";


        /* Show page */

        document.getElementById(
            "loading"
        ).style.display = "none";


        document.getElementById(
            "ticket-container"
        ).style.display = "block";

    }


    catch (error) {

        console.error(error);

        showError(
            "Unable to load this ticket. Make sure the FastAPI server is running."
        );

    }

}


/* =========================
   UPDATE TICKET
========================= */

document
    .getElementById("update-ticket-form")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const status =
                document.getElementById(
                    "status"
                ).value;


            const notes =
                document.getElementById(
                    "notes"
                ).value;


            try {

                const response = await fetch(
                    `${API_URL}/${ticketId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            status: status,

                            notes: notes

                        })
                    }
                );


                if (!response.ok) {

                    const errorText =
                        await response.text();

                    console.error(
                        errorText
                    );

                    throw new Error(
                        "Update failed."
                    );

                }


                alert(
                    "Ticket updated successfully."
                );


                /* Reload updated ticket */

                await loadTicket();

            }


            catch (error) {

                console.error(error);

                alert(
                    "Unable to update ticket."
                );

            }

        }
    );


/* =========================
   PAGE LOAD
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadTicket();

    }
);
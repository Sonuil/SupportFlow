const API_URL = "https://supportflow-9hor.onrender.com/api/tickets/";
/* =========================
   HELPERS
========================= */

function escapeHTML(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(value) {
    if (!value) return "N/A";

    const date = new Date(value);

    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================
   LOAD ALL TICKETS
========================= */

async function loadTickets() {

    const container = document.getElementById("ticket-list");

    if (!container) {
        console.error("ticket-list not found");
        return;
    }

    container.innerHTML = `
        <div class="loading-message">
            Loading tickets...
        </div>
    `;

    try {

        const response = await fetch(API_URL, {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        const tickets = await response.json();

        console.log("Tickets loaded:", tickets);

        displayTickets(tickets);

    } catch (error) {

        console.error("Error loading tickets:", error);

        container.innerHTML = `
            <div class="error-box">
                Unable to load tickets.
                <br>
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}


/* =========================
   DISPLAY TICKETS
========================= */

function displayTickets(tickets) {

    const container = document.getElementById("ticket-list");

    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(tickets) || tickets.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                No tickets found.
            </div>
        `;

        return;
    }

    tickets.forEach(ticket => {

        const id = ticket.id;

        const ticketNumber =
            ticket.ticket_id ||
            `TKT-${String(id).padStart(3, "0")}`;

        const subject =
            ticket.subject || "No Subject";

        const customerName =
            ticket.customer_name || "N/A";

        const customerEmail =
            ticket.customer_email || "N/A";

        const description =
            ticket.description || "N/A";

        const notes =
            ticket.notes || "No notes added yet.";

        const status =
            ticket.status || "Open";


        let statusClass = "status-open";

        if (status === "In Progress") {
            statusClass = "status-progress";
        }

        if (status === "Closed") {
            statusClass = "status-closed";
        }


        const card = document.createElement("div");

        card.className = "ticket-card";


        card.innerHTML = `

            <div class="ticket-card-header">

                <div>

                    <div class="ticket-id">
                        ${escapeHTML(ticketNumber)}
                    </div>

                    <h3>
                        ${escapeHTML(subject)}
                    </h3>

                </div>

                <span class="status-badge ${statusClass}">
                    ${escapeHTML(status)}
                </span>

            </div>


            <div class="ticket-details">

                <p>
                    <strong>Customer:</strong>
                    ${escapeHTML(customerName)}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(customerEmail)}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${escapeHTML(description)}
                </p>

                <p>
                    <strong>Support Notes:</strong>
                    ${escapeHTML(notes)}
                </p>

            </div>


            <div class="ticket-footer">

                <span class="created-date">
                    Created: ${formatDate(ticket.created_at)}
                </span>


                <div class="ticket-actions">

                    <a
                        href="ticket-detail.html?id=${id}"
                        class="view-ticket-btn"
                    >
                        View Ticket
                    </a>


                    <button
                        type="button"
                        class="update-ticket-btn"
                        data-id="${id}"
                    >
                        Update
                    </button>

                </div>

            </div>

        `;


        const updateButton =
            card.querySelector(".update-ticket-btn");


        updateButton.addEventListener(
            "click",
            function () {
                updateTicket(id);
            }
        );


        container.appendChild(card);

    });


    filterTickets();
}


/* =========================
   CREATE TICKET
========================= */

async function createTicket(event) {

    event.preventDefault();

    const nameElement =
        document.getElementById("customer-name");

    const emailElement =
        document.getElementById("customer-email");

    const subjectElement =
        document.getElementById("subject");

    const descriptionElement =
        document.getElementById("description");


    if (
        !nameElement ||
        !emailElement ||
        !subjectElement ||
        !descriptionElement
    ) {

        alert("Ticket form fields not found.");

        return;
    }


    const customerName =
        nameElement.value.trim();

    const customerEmail =
        emailElement.value.trim();

    const subject =
        subjectElement.value.trim();

    const description =
        descriptionElement.value.trim();


    if (
        !customerName ||
        !customerEmail ||
        !subject ||
        !description
    ) {

        alert("Please fill in all fields.");

        return;
    }


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                customer_name: customerName,

                customer_email: customerEmail,

                subject: subject,

                description: description

            })

        });


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(errorText);

            throw new Error(
                "Unable to create ticket."
            );
        }


       const responseText = await response.text();

console.log("POST response:", responseText);

let createdTicket = {};

try {
    createdTicket = responseText ? JSON.parse(responseText) : {};
} catch (e) {
    console.warn("Response was not JSON:", responseText);
}

alert(
    "Ticket created successfully!\n\n" +
    "Ticket ID: " +
    (createdTicket.ticket_id || createdTicket.id || "Created")
);
        const form =
            document.getElementById("ticket-form");

        if (form) {
            form.reset();
        }


        await loadTickets();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to create ticket. " +
            "Make sure the FastAPI server is running."
        );
    }
}


/* =========================
   UPDATE TICKET
========================= */

async function updateTicket(ticketId) {

    let status = prompt(
        "Enter new status:\n\nOpen\nIn Progress\nClosed",
        "Open"
    );


    if (status === null) {
        return;
    }


    status = status.trim();


    if (
        status !== "Open" &&
        status !== "In Progress" &&
        status !== "Closed"
    ) {

        alert(
            "Invalid status.\n\n" +
            "Use exactly:\n" +
            "Open\n" +
            "In Progress\n" +
            "Closed"
        );

        return;
    }


    let notes = prompt(
        "Enter support notes:",
        ""
    );


    if (notes === null) {
        return;
    }


    notes = notes.trim();


    try {

        const response = await fetch(
            `${API_URL}${ticketId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
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

            console.error(errorText);

            throw new Error(
                "Unable to update ticket."
            );
        }


        alert(
            "Ticket updated successfully."
        );


        await loadTickets();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update ticket."
        );
    }
}


/* =========================
   SEARCH + STATUS FILTER
========================= */

function filterTickets() {

    const searchInput =
        document.getElementById("search-input");

    const statusFilter =
        document.getElementById("status-filter");


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "";


    const cards =
        document.querySelectorAll(
            ".ticket-card"
        );


    cards.forEach(card => {

        const text =
            card.textContent
                .toLowerCase();


        const badge =
            card.querySelector(
                ".status-badge"
            );


        const cardStatus =
            badge
                ? badge.textContent.trim()
                : "";


        const matchesSearch =
            text.includes(search);


        const matchesStatus =
            selectedStatus === "" ||
            cardStatus === selectedStatus;


        if (
            matchesSearch &&
            matchesStatus
        ) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });
}


/* =========================
   PAGE INITIALIZATION
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "SupportFlow script loaded"
        );


        /* CREATE FORM */

        const ticketForm =
            document.getElementById(
                "ticket-form"
            );


        if (ticketForm) {

            ticketForm.addEventListener(
                "submit",
                createTicket
            );

        }


        /* SEARCH */

        const searchInput =
            document.getElementById(
                "search-input"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                filterTickets
            );

        }


        /* STATUS FILTER */

        const statusFilter =
            document.getElementById(
                "status-filter"
            );


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                filterTickets
            );

        }


        /* LOAD TICKETS */

        loadTickets();

    }
);
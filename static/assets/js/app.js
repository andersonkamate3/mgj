// ===== APPLICATION STATE =====
class EventApp {
    constructor() {
        this.events = JSON.parse(localStorage.getItem('events')) || [];
        this.tickets = JSON.parse(localStorage.getItem('tickets')) || [];
        this.comments = JSON.parse(localStorage.getItem('comments')) || {};
        this.currentEvent = null;
        this.init();
    }

    init() {
        this.initAOS();
        this.bindEvents();
        this.loadEvents();
        this.setupNavigation();
    }

    // Initialize AOS (Animate On Scroll)
    initAOS() {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }

    // Bind all event listeners
    bindEvents() {
        // Create event form
        document.getElementById('createEventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createEvent();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchEvents(e.target.value);
        });

        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectPaymentMethod(e.currentTarget.dataset.method);
            });
        });

        // Navigation smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Setup navigation
    setupNavigation() {
        window.showCreateEvent = () => {
            document.getElementById('events').classList.add('d-none');
            document.getElementById('create-event').classList.remove('d-none');
            document.querySelector('#create-event').scrollIntoView({ behavior: 'smooth' });
        };

        window.showEvents = () => {
            document.getElementById('create-event').classList.add('d-none');
            document.getElementById('events').classList.remove('d-none');
            document.querySelector('#events').scrollIntoView({ behavior: 'smooth' });
        };
    }

    // Create new event
    createEvent() {
        const form = document.getElementById('createEventForm');
        const formData = new FormData(form);
        
        const event = {
            id: Date.now().toString(),
            name: formData.get('eventName') || document.getElementById('eventName').value,
            date: formData.get('eventDate') || document.getElementById('eventDate').value,
            location: formData.get('eventLocation') || document.getElementById('eventLocation').value,
            price: parseFloat(formData.get('eventPrice') || document.getElementById('eventPrice').value),
            description: formData.get('eventDescription') || document.getElementById('eventDescription').value,
            category: formData.get('eventCategory') || document.getElementById('eventCategory').value,
            capacity: parseInt(formData.get('eventCapacity') || document.getElementById('eventCapacity').value),
            image: this.handleImageUpload(),
            createdAt: new Date().toISOString(),
            soldTickets: 0
        };

        this.events.push(event);
        this.saveEvents();
        this.loadEvents();
        
        // Show success message
        this.showNotification('Événement créé avec succès!', 'success');
        
        // Reset form and show events
        form.reset();
        showEvents();
    }

    // Handle image upload (simulate)
    handleImageUpload() {
        const imageInput = document.getElementById('eventImage');
        if (imageInput.files && imageInput.files[0]) {
            // In a real app, you would upload to a server
            // For demo, we'll use a placeholder
            return `https://picsum.photos/400/300?random=${Date.now()}`;
        }
        return 'https://picsum.photos/400/300?random=default';
    }

    // Load and display events
    loadEvents() {
        const eventsGrid = document.getElementById('eventsGrid');
        
        if (this.events.length === 0) {
            eventsGrid.innerHTML = this.getEmptyState();
            return;
        }

        eventsGrid.innerHTML = this.events.map(event => this.createEventCard(event)).join('');
    }

    // Create event card HTML
    createEventCard(event) {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const availableTickets = event.capacity - event.soldTickets;
        const isAvailable = availableTickets > 0;

        return `
            <div class="col-md-6 col-lg-4 mb-4" data-aos="fade-up">
                <div class="card event-card hover-lift" onclick="eventApp.showEventDetail('${event.id}')">
                    <div class="position-relative">
                        <img src="${event.image}" class="card-img-top" alt="${event.name}">
                        <span class="category-badge">${this.getCategoryLabel(event.category)}</span>
                        <span class="price-badge">${event.price}€</span>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${event.name}</h5>
                        <p class="card-text text-muted mb-2">
                            <i class="fas fa-calendar me-2"></i>${formattedDate}
                        </p>
                        <p class="card-text text-muted mb-2">
                            <i class="fas fa-clock me-2"></i>${formattedTime}
                        </p>
                        <p class="card-text text-muted mb-3">
                            <i class="fas fa-map-marker-alt me-2"></i>${event.location}
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                ${availableTickets} places restantes
                            </small>
                            <span class="badge ${isAvailable ? 'bg-success' : 'bg-danger'}">
                                ${isAvailable ? 'Disponible' : 'Complet'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Get category label
    getCategoryLabel(category) {
        const labels = {
            'concert': 'Concert',
            'conference': 'Conférence',
            'sport': 'Sport',
            'theatre': 'Théâtre',
            'festival': 'Festival',
            'autre': 'Autre'
        };
        return labels[category] || 'Autre';
    }

    // Show event detail modal
    showEventDetail(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        this.currentEvent = event;
        const modal = new bootstrap.Modal(document.getElementById('eventDetailModal'));
        
        document.getElementById('eventDetailTitle').textContent = event.name;
        document.getElementById('eventDetailBody').innerHTML = this.createEventDetailHTML(event);
        
        modal.show();
        
        // Load comments for this event
        this.loadComments(eventId);
    }

    // Create event detail HTML
    createEventDetailHTML(event) {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const availableTickets = event.capacity - event.soldTickets;
        const isAvailable = availableTickets > 0;

        return `
            <div class="row">
                <div class="col-md-6">
                    <img src="${event.image}" class="img-fluid rounded mb-3" alt="${event.name}">
                </div>
                <div class="col-md-6">
                    <h4 class="fw-bold mb-3">${event.name}</h4>
                    <div class="mb-3">
                        <h6 class="fw-semibold">Date et Heure</h6>
                        <p class="text-muted"><i class="fas fa-calendar me-2"></i>${formattedDate}</p>
                    </div>
                    <div class="mb-3">
                        <h6 class="fw-semibold">Lieu</h6>
                        <p class="text-muted"><i class="fas fa-map-marker-alt me-2"></i>${event.location}</p>
                    </div>
                    <div class="mb-3">
                        <h6 class="fw-semibold">Prix</h6>
                        <p class="text-primary fw-bold fs-4">${event.price}€</p>
                    </div>
                    <div class="mb-3">
                        <h6 class="fw-semibold">Places disponibles</h6>
                        <p class="text-muted">${availableTickets} / ${event.capacity}</p>
                    </div>
                    ${isAvailable ? `
                        <button class="btn btn-primary btn-lg w-100 mb-3" onclick="eventApp.buyTicket('${event.id}')">
                            <i class="fas fa-ticket-alt me-2"></i>Acheter un billet
                        </button>
                    ` : `
                        <button class="btn btn-secondary btn-lg w-100 mb-3" disabled>
                            <i class="fas fa-times me-2"></i>Événement complet
                        </button>
                    `}
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-12">
                    <h6 class="fw-semibold">Description</h6>
                    <p class="text-muted">${event.description}</p>
                </div>
            </div>
            
            <!-- Comments Section -->
            <div class="comments-section mt-4">
                <h6 class="fw-semibold mb-3">Commentaires</h6>
                
                <!-- Add Comment Form -->
                <div class="mb-4">
                    <div class="input-group">
                        <input type="text" class="form-control" id="commentInput" placeholder="Ajouter un commentaire...">
                        <button class="btn btn-primary" onclick="eventApp.addComment('${event.id}')">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Comments List -->
                <div id="commentsList">
                    <!-- Comments will be loaded here -->
                </div>
            </div>
        `;
    }

    // Buy ticket
    buyTicket(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        this.currentEvent = event;
        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        modal.show();
    }

    // Select payment method
    selectPaymentMethod(method) {
        // Remove active class from all buttons
        document.querySelectorAll('.payment-method').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected button
        event.target.closest('.payment-method').classList.add('active');
        
        // Show payment form
        const paymentForm = document.getElementById('paymentForm');
        paymentForm.classList.remove('d-none');
        paymentForm.innerHTML = this.createPaymentForm(method);
    }

    // Create payment form
    createPaymentForm(method) {
        if (method === 'stripe') {
            return `
                <h6 class="mb-3">Paiement par Carte Bancaire</h6>
                <div class="mb-3">
                    <label class="form-label">Numéro de carte</label>
                    <input type="text" class="form-control" placeholder="1234 5678 9012 3456" maxlength="19">
                </div>
                <div class="row">
                    <div class="col-6">
                        <label class="form-label">Date d'expiration</label>
                        <input type="text" class="form-control" placeholder="MM/AA" maxlength="5">
                    </div>
                    <div class="col-6">
                        <label class="form-label">CVV</label>
                        <input type="text" class="form-control" placeholder="123" maxlength="3">
                    </div>
                </div>
                <div class="mt-3">
                    <label class="form-label">Nom sur la carte</label>
                    <input type="text" class="form-control" placeholder="John Doe">
                </div>
                <button class="btn btn-success w-100 mt-3" onclick="eventApp.processPayment('stripe')">
                    <i class="fas fa-credit-card me-2"></i>Payer ${this.currentEvent.price}€
                </button>
            `;
        } else if (method === 'bitcoin') {
            return `
                <h6 class="mb-3">Paiement Bitcoin</h6>
                <div class="text-center mb-3">
                    <div class="bg-light p-4 rounded">
                        <i class="fab fa-bitcoin fa-3x text-warning mb-3"></i>
                        <p class="mb-2">Montant: <strong>${this.currentEvent.price}€</strong></p>
                        <p class="mb-2">≈ 0.00123 BTC</p>
                        <small class="text-muted">Adresse Bitcoin:</small>
                        <div class="bg-white p-2 rounded mt-2 font-monospace small">
                            1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">ID de transaction</label>
                    <input type="text" class="form-control" placeholder="Entrez l'ID de votre transaction">
                </div>
                <button class="btn btn-warning w-100" onclick="eventApp.processPayment('bitcoin')">
                    <i class="fab fa-bitcoin me-2"></i>Confirmer le paiement
                </button>
            `;
        }
    }

    // Process payment
    processPayment(method) {
        // Simulate payment processing
        this.showNotification('Traitement du paiement...', 'info');
        
        setTimeout(() => {
            // Simulate successful payment
            const ticket = this.generateTicket(this.currentEvent, method);
            this.tickets.push(ticket);
            this.saveTickets();
            
            // Update event sold tickets
            const eventIndex = this.events.findIndex(e => e.id === this.currentEvent.id);
            if (eventIndex !== -1) {
                this.events[eventIndex].soldTickets++;
                this.saveEvents();
            }
            
            // Close payment modal
            bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
            
            // Show ticket
            this.showTicket(ticket);
            
            this.showNotification('Paiement réussi! Votre billet a été généré.', 'success');
        }, 2000);
    }

    // Generate ticket
    generateTicket(event, paymentMethod) {
        return {
            id: Date.now().toString(),
            eventId: event.id,
            eventName: event.name,
            eventDate: event.date,
            eventLocation: event.location,
            price: event.price,
            paymentMethod: paymentMethod,
            purchaseDate: new Date().toISOString(),
            qrCode: this.generateQRCode(),
            ticketNumber: `2GO-${Date.now().toString().slice(-6)}`
        };
    }

    // Generate QR code (simulate)
    generateQRCode() {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`2GO-TICKET-${Date.now()}`)}`;
    }

    // Show ticket modal
    showTicket(ticket) {
        const modal = new bootstrap.Modal(document.getElementById('ticketModal'));
        document.getElementById('ticketContent').innerHTML = this.createTicketHTML(ticket);
        modal.show();
    }

    // Create ticket HTML
    createTicketHTML(ticket) {
        const eventDate = new Date(ticket.eventDate);
        const formattedDate = eventDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="ticket" id="printableTicket">
                <div class="ticket-header">
                    <h4 class="fw-bold text-primary mb-2">
                        <i class="fas fa-ticket-alt me-2"></i>2go
                    </h4>
                    <h5 class="fw-bold">${ticket.eventName}</h5>
                    <div class="ticket-qr">
                        <img src="${ticket.qrCode}" alt="QR Code" class="img-fluid">
                    </div>
                </div>
                
                <div class="ticket-info">
                    <div class="ticket-field">
                        <div class="label">Date</div>
                        <div class="value">${formattedDate}</div>
                    </div>
                    <div class="ticket-field">
                        <div class="label">Heure</div>
                        <div class="value">${formattedTime}</div>
                    </div>
                    <div class="ticket-field">
                        <div class="label">Lieu</div>
                        <div class="value">${ticket.eventLocation}</div>
                    </div>
                    <div class="ticket-field">
                        <div class="label">Prix</div>
                        <div class="value">${ticket.price}€</div>
                    </div>
                </div>
                
                <div class="text-center mt-3">
                    <div class="ticket-field">
                        <div class="label">Numéro de billet</div>
                        <div class="value font-monospace">${ticket.ticketNumber}</div>
                    </div>
                </div>
                
                <div class="text-center mt-3">
                    <small class="text-muted">
                        Billet acheté le ${new Date(ticket.purchaseDate).toLocaleDateString('fr-FR')}
                        <br>
                        Méthode de paiement: ${ticket.paymentMethod === 'stripe' ? 'Carte bancaire' : 'Bitcoin'}
                    </small>
                </div>
            </div>
        `;
    }

    // Add comment
    addComment(eventId) {
        const commentInput = document.getElementById('commentInput');
        const commentText = commentInput.value.trim();
        
        if (!commentText) return;
        
        if (!this.comments[eventId]) {
            this.comments[eventId] = [];
        }
        
        const comment = {
            id: Date.now().toString(),
            text: commentText,
            author: 'Utilisateur', // In a real app, this would be the logged-in user
            date: new Date().toISOString()
        };
        
        this.comments[eventId].push(comment);
        this.saveComments();
        
        commentInput.value = '';
        this.loadComments(eventId);
        
        this.showNotification('Commentaire ajouté!', 'success');
    }

    // Load comments
    loadComments(eventId) {
        const commentsList = document.getElementById('commentsList');
        const eventComments = this.comments[eventId] || [];
        
        if (eventComments.length === 0) {
            commentsList.innerHTML = '<p class="text-muted text-center">Aucun commentaire pour le moment.</p>';
            return;
        }
        
        commentsList.innerHTML = eventComments.map(comment => `
            <div class="comment">
                <div class="comment-author">${comment.author}</div>
                <div class="comment-date">${new Date(comment.date).toLocaleDateString('fr-FR')}</div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `).join('');
    }

    // Search events
    searchEvents(query) {
        const filteredEvents = this.events.filter(event => 
            event.name.toLowerCase().includes(query.toLowerCase()) ||
            event.location.toLowerCase().includes(query.toLowerCase()) ||
            event.category.toLowerCase().includes(query.toLowerCase())
        );
        
        const eventsGrid = document.getElementById('eventsGrid');
        
        if (filteredEvents.length === 0) {
            eventsGrid.innerHTML = `
                <div class="col-12 text-center">
                    <div class="py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Aucun événement trouvé</h5>
                        <p class="text-muted">Essayez avec d'autres mots-clés</p>
                    </div>
                </div>
            `;
            return;
        }
        
        eventsGrid.innerHTML = filteredEvents.map(event => this.createEventCard(event)).join('');
    }

    // Get empty state HTML
    getEmptyState() {
        return `
            <div class="col-12 text-center">
                <div class="py-5">
                    <i class="fas fa-calendar-plus fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Aucun événement disponible</h5>
                    <p class="text-muted">Soyez le premier à créer un événement!</p>
                    <button class="btn btn-primary" onclick="showCreateEvent()">
                        <i class="fas fa-plus me-2"></i>Créer un événement
                    </button>
                </div>
            </div>
        `;
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Save data to localStorage
    saveEvents() {
        localStorage.setItem('events', JSON.stringify(this.events));
    }

    saveTickets() {
        localStorage.setItem('tickets', JSON.stringify(this.tickets));
    }

    saveComments() {
        localStorage.setItem('comments', JSON.stringify(this.comments));
    }
}

// ===== GLOBAL FUNCTIONS =====

// Print ticket
window.printTicket = function() {
    const printContent = document.getElementById('printableTicket').outerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Billet 2go</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="css/style.css">
            </head>
            <body>
                ${printContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};

// Download ticket
window.downloadTicket = function() {
    const ticketElement = document.getElementById('printableTicket');
    
    // Create a canvas to convert HTML to image
    html2canvas(ticketElement).then(canvas => {
        const link = document.createElement('a');
        link.download = `billet-2go-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }).catch(() => {
        // Fallback: open print dialog
        printTicket();
    });
};

// ===== INITIALIZE APP =====
let eventApp;

document.addEventListener('DOMContentLoaded', function() {
    eventApp = new EventApp();
    
    // Add some demo events if none exist
    if (eventApp.events.length === 0) {
        const demoEvents = [
            {
                id: '1',
                name: 'Concert Jazz Festival',
                date: '2024-12-25T20:00',
                location: 'Salle Pleyel, Paris',
                price: 45.00,
                description: 'Une soirée exceptionnelle avec les plus grands noms du jazz international.',
                category: 'concert',
                capacity: 500,
                image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                createdAt: new Date().toISOString(),
                soldTickets: 120
            },
            {
                id: '2',
                name: 'Conférence Tech 2024',
                date: '2024-12-30T09:00',
                location: 'Palais des Congrès, Lyon',
                price: 25.00,
                description: 'Les dernières innovations technologiques présentées par des experts.',
                category: 'conference',
                capacity: 1000,
                image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
                createdAt: new Date().toISOString(),
                soldTickets: 350
            }
        ];
        
        eventApp.events = demoEvents;
        eventApp.saveEvents();
        eventApp.loadEvents();
    }
});

// ===== UTILITY FUNCTIONS =====

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Generate random ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}


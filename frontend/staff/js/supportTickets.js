// frontend/staff/js/supportTickets.js
import { requireStaffAuth } from './staffSession.js';
import { getElement, setText, addClass, removeClass } from './utils.js'; // Added addClass, removeClass, setText
// import { api } from '../../common/js/apiService.js'; // For API calls later

document.addEventListener('DOMContentLoaded', () => {
    // Path to login.html is relative to where supportTickets.js is (js folder)
    // and where support.html is (pages folder)
    // So from /staff/js/supportTickets.js to /staff/pages/login.html is '../pages/login.html'
    // However, the requireStaffAuth itself is typically called from the HTML page's script,
    // or if called here, its internal redirectTo needs to be aware of the current page's path.
    // The inline script in support.html already calls requireStaffAuth correctly.
    // If we also call it here, ensure paths are consistent or rely on the HTML's call.
    // For modularity, it's fine to have it here too, assuming utils.js's redirectTo can handle it.
    requireStaffAuth('../pages/login.html'); 

    console.log('Support tickets page script loaded.');
    loadSupportTickets();

    const applyFiltersButton = getElement('apply-ticket-filters-button');
    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', handleFilterTickets);
    }
});

async function loadSupportTickets(filters = {}) {
    console.log('Loading support tickets with filters:', filters);
    let mockTickets = [
        { id: 't001', userId: 'user123', subject: 'Login Issue', status: 'Open', priority: 'High', createdDate: '2023-10-25', lastUpdated: '2023-10-25', assignedTo: 'staffA' },
        { id: 't002', userId: 'user456', subject: 'Billing question', status: 'In Progress', priority: 'Medium', createdDate: '2023-10-26', lastUpdated: '2023-10-27', assignedTo: 'staffB' },
        { id: 't003', userId: 'user789', subject: 'Feature request: Dark Mode', status: 'Open', priority: 'Low', createdDate: '2023-10-27', lastUpdated: '2023-10-28', assignedTo: 'Unassigned' },
        { id: 't004', userId: 'userABC', subject: 'Profile picture not updating', status: 'Closed', priority: 'High', createdDate: '2023-10-22', lastUpdated: '2023-10-23', assignedTo: 'staffA' },
        { id: 't005', userId: 'userXYZ', subject: 'Harassment report against UserXXX', status: 'In Progress', priority: 'High', createdDate: '2023-10-28', lastUpdated: '2023-10-28', assignedTo: 'staffC' },
    ];

    // Mock filtering
    if (filters.status && filters.status !== 'all') {
        mockTickets = mockTickets.filter(ticket => ticket.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
        mockTickets = mockTickets.filter(ticket => ticket.priority === filters.priority);
    }

    // Mock sorting
    if (filters.sortBy === 'oldest') {
        mockTickets.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    } else if (filters.sortBy === 'last_updated') {
        mockTickets.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    } else { // newest or default
        mockTickets.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    }


    const ticketsContainer = getElement('support-tickets-container'); // This is a <tbody>
    if (!ticketsContainer) {
        console.error('Support tickets container (tbody) not found');
        return;
    }
    ticketsContainer.innerHTML = ''; // Clear previous rows

    if (mockTickets.length === 0) {
        const colSpan = 7; // Number of columns in the table
        ticketsContainer.innerHTML = \`<tr><td colspan="\${colSpan}" class="text-center py-4 text-gray-500">No support tickets found matching your filters.</td></tr>\`;
        return;
    }

    mockTickets.forEach(ticket => {
        const ticketElement = createTicketElement(ticket);
        ticketsContainer.appendChild(ticketElement);
    });
}

function createTicketElement(ticket) {
    const tr = document.createElement('tr');
    tr.className = 'border-b hover:bg-gray-50 ticket-item transition-colors duration-150';
    tr.dataset.ticketId = ticket.id;

    let statusClass = 'bg-gray-200 text-gray-700';
    if (ticket.status === 'Open') statusClass = 'bg-red-100 text-red-700';
    else if (ticket.status === 'In Progress') statusClass = 'bg-yellow-100 text-yellow-700';
    else if (ticket.status === 'Closed') statusClass = 'bg-green-100 text-green-700';
    
    let priorityClass = '';
    if (ticket.priority === 'High') priorityClass = 'font-semibold text-red-600';
    else if (ticket.priority === 'Medium') priorityClass = 'font-semibold text-yellow-600';


    tr.innerHTML = \`
        <td class="py-3 px-3 text-sm text-gray-700 \${priorityClass}">${ticket.id}</td>
        <td class="py-3 px-3 text-sm text-gray-700">${ticket.userId}</td>
        <td class="py-3 px-3 text-sm text-gray-700">${ticket.subject}</td>
        <td class="py-3 px-3 text-sm">
            <span class="\${statusClass} py-1 px-2 rounded-full text-xs font-medium">${ticket.status}</span>
        </td>
        <td class="py-3 px-3 text-sm text-gray-500">${ticket.createdDate}</td>
        <td class="py-3 px-3 text-sm text-gray-500">${ticket.assignedTo || 'Unassigned'}</td>
        <td class="py-3 px-3 text-sm">
            <button class="text-primary hover:text-pink-700 font-medium btn-view-ticket" data-ticket-id="\${ticket.id}">View</button>
            <!-- Add more actions like 'Assign' later -->
        </td>
    \`;
    
    const viewButton = tr.querySelector('.btn-view-ticket');
    if(viewButton) {
        viewButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent row click if any
            viewTicketDetails(ticket.id);
        });
    }

    // Example: Make row clickable
    tr.addEventListener('click', () => viewTicketDetails(ticket.id));
    tr.style.cursor = 'pointer';

    return tr;
}

function viewTicketDetails(ticketId) {
    console.log(\`Viewing details for ticket ${ticketId}\`);
    // Later, this would redirect to a ticket detail page or open a modal
    // For now, an alert will suffice as per instructions
    alert(\`Mock Action: View details for ticket ${ticketId}. \n(Full implementation for ticket detail page/modal is pending.)\`);
    // Example redirection:
    // window.location.href = \`./support-ticket-detail.html?id=\${ticketId}\`;
}

function handleFilterTickets() {
    const status = getElement('filter-status').value;
    const priority = getElement('filter-priority').value;
    const sortBy = getElement('sort-by').value;
    console.log(\`Filtering tickets by Status: \${status}, Priority: \${priority}, SortBy: \${sortBy}\`);
    loadSupportTickets({ status, priority, sortBy });
}

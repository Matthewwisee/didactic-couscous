// Show message to user
function showMessage(message, type = 'info') {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => {
        messagesDiv.innerHTML = '';
    }, 5000);
}

// CREATE - Add new guitar
document.getElementById('addGuitarForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const guitar = {
        name: document.getElementById('name').value,
        price: parseInt(document.getElementById('price').value),
        color: document.getElementById('color').value
    };

    try {
        const response = await fetch('/api/guitars', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guitar)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`✅ Guitar "${guitar.name}" added successfully!`, 'success');
            document.getElementById('addGuitarForm').reset();
            loadGuitars();
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
});

// READ - Load all guitars
async function loadGuitars() {
    try {
        const response = await fetch('/api/guitars');
        const guitars = await response.json();

        const guitarsList = document.getElementById('guitarsList');

        if (!Array.isArray(guitars) || guitars.length === 0) {
            guitarsList.innerHTML = '<p class="text-muted">No guitars found.</p>';
            return;
        }

        guitarsList.innerHTML = guitars.map(guitar => `
            <div class="card mb-2">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${guitar.name}</strong> | Price: $${guitar.price} | Color: ${guitar.color}
                    </div>
                        <!-- BS5 Button Group src: https://getbootstrap.com/docs/5.0/components/button-group/ --> 
                        <div class="btn-group" role="group">
                            <!-- Edit button / Update Modal Trigger -->
                            <button 
                                type="button" 
                                class="btn btn-outline-dark btn-sm"
                                data-bs-toggle="modal"
                                data-bs-target="#updateGuitarModal"
                                onclick="fillUpdateForm('${guitar._id}', '${guitar.name}', '${guitar.price}', '${guitar.color}')"

                            >
                                <i class="bi bi-pencil-fill"></i> 
                            </button>
                        
                            <!-- Delete Button -->
                            <button 
                                type="button" 
                                class="btn btn-outline-dark btn-sm"
                                onclick="deleteGuitar('${guitar._id}', '${guitar.name}')"
                            >
                                <i class="bi bi-trash3-fill"></i> 
                            </button>
                        </div>

                </div>
            </div>
        `).join('');

        // Add click event listeners for guitar IDs
        document.querySelectorAll('.guitar-id').forEach(span => {
            span.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const age = this.getAttribute('data-price');
                const grade = this.getAttribute('data-color');
                fillUpdateForm(id, name, price, color);
            });
        });

        // Add click event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const id = this.getAttribute('data-guitar-id');
                const name = this.getAttribute('data-guitar-name');
                deleteGuitar(id, name);
            });
        });

        showMessage(`📋 Loaded ${guitars.length} guitars`, 'info');
    } catch (error) {
        showMessage(`❌ Error loading guitars: ${error.message}`, 'danger');
    }
}

// Fill update modal
function fillUpdateForm(id, name, price, color) {
    document.getElementById('updateId').value = id;
    document.getElementById('updateName').value = name;
    document.getElementById('updatePrice').value = price;
    document.getElementById('updateColor').value = color;
    showMessage('📝 Guitar data loaded in update form', 'info');
}

// UPDATE - Update guitar
document.getElementById('updateGuitarForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('updateId').value;
    const guitar = {
        name: document.getElementById('updateName').value,
        price: parseInt(document.getElementById('updatePrice').value),
        color: document.getElementById('updateColor').value
    };

    try {
        const response = await fetch(`/api/guitars/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guitar)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`✅ Guitar "${guitar.name}" updated successfully!`, 'success');
            document.getElementById('updateGuitarForm').reset();
            loadGuitars();
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
});

// DELETE - Delete guitar
async function deleteGuitar(id, name) {
    if (!confirm(`🗑️ Delete Guitar "${name}"?`)) {
        return;
    }
    try {
        const response = await fetch(`/api/guitars/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`✅ Guitar "${name}" deleted successfully!`, 'success');
            loadGuitars(); // Refresh the list
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
}

window.addEventListener('load', loadGuitars);

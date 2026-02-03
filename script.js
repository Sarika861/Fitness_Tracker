const fitnessForm = document.getElementById('fitnessForm');
const fitnessTableBody = document.querySelector('#fitnessTable tbody');
const chartSelect = document.getElementById('chartType');
const ctx = document.getElementById('fitnessChart').getContext('2d');

let entries = JSON.parse(localStorage.getItem('fitnessEntries')) || [];
let chart;

// ===== Display Entries =====
function displayEntries() {
    fitnessTableBody.innerHTML = '';
    entries.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.exercise}</td>
            <td>${entry.duration}</td>
            <td>${entry.calories}</td>
            <td><button class="action-btn" onclick="deleteEntry(${index})">Delete</button></td>
        `;
        fitnessTableBody.appendChild(row);
    });
    updateChart();
}

// ===== Add Entry =====
fitnessForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newEntry = {
        date: document.getElementById('date').value,
        exercise: document.getElementById('exercise').value,
        duration: Number(document.getElementById('duration').value),
        calories: Number(document.getElementById('calories').value)
    };
    entries.push(newEntry);
    localStorage.setItem('fitnessEntries', JSON.stringify(entries));
    fitnessForm.reset();
    displayEntries();
});

// ===== Delete Entry =====
function deleteEntry(index) {
    entries.splice(index, 1);
    localStorage.setItem('fitnessEntries', JSON.stringify(entries));
    displayEntries();
}

// ===== Chart =====
function updateChart() {
    const chartType = chartSelect.value;

    if (chart) chart.destroy();

    if(chartType === 'line') {
        // Calories over time
        const sorted = [...entries].sort((a,b) => new Date(a.date)-new Date(b.date));
        const labels = sorted.map(e => e.date);
        const data = sorted.map(e => e.calories);
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Calories Burned',
                    data,
                    borderColor: 'rgba(40,167,69,1)',
                    backgroundColor: 'rgba(40,167,69,0.2)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive:true,
                plugins:{legend:{display:true}},
                scales:{
                    y:{beginAtZero:true,title:{display:true,text:'Calories'}},
                    x:{title:{display:true,text:'Date'}}
                }
            }
        });
    } else if(chartType === 'bar') {
        // Duration over time
        const sorted = [...entries].sort((a,b) => new Date(a.date)-new Date(b.date));
        const labels = sorted.map(e => e.date);
        const data = sorted.map(e => e.duration);
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets:[{
                    label:'Duration (min)',
                    data,
                    backgroundColor:'rgba(40,167,69,0.6)',
                    borderColor:'rgba(40,167,69,1)',
                    borderWidth:1
                }]
            },
            options:{
                responsive:true,
                plugins:{legend:{display:true}},
                scales:{
                    y:{beginAtZero:true,title:{display:true,text:'Minutes'}},
                    x:{title:{display:true,text:'Date'}}
                }
            }
        });
    } else if(chartType === 'pie') {
        // Exercise type distribution
        const exerciseMap = {};
        entries.forEach(e => {
            exerciseMap[e.exercise] = (exerciseMap[e.exercise] || 0) + 1;
        });
        chart = new Chart(ctx, {
            type:'pie',
            data:{
                labels:Object.keys(exerciseMap),
                datasets:[{
                    label:'Exercise Type',
                    data:Object.values(exerciseMap),
                    backgroundColor:[
                        '#28a745','#ffc107','#dc3545','#17a2b8','#6f42c1','#fd7e14'
                    ]
                }]
            },
            options:{responsive:true}
        });
    }
}

// Update chart when chart type changes
chartSelect.addEventListener('change', updateChart);

// Initial display
displayEntries();

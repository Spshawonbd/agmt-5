// Global variable to store all fetched issues for filtering
let allIssues = [];



/**
 * Handles User Login logic.
 * Checks for hardcoded credentials and toggles UI visibility.
 */


function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') {

        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        fetchIssues();
    } else {
        alert("Invalid Username or Password!");
    }
}



/**
 * Fetches the list of issues from the external API.
 * Includes error handling and loader state management.
 */


async function fetchIssues() {
    toggleLoader(true); 
    try {
        const res = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
        const data = await res.json();
        allIssues = data.data; 
        displayIssues(allIssues); 
    } catch (err) {
        console.error("Fetch Error:", err);
    } finally {
        toggleLoader(false); 
    }
}



/**
 * Dynamically renders issue cards into the HTML container.
 * Handles conditional styling based on status and priority.
 */


function displayIssues(issues) {
    const container = document.getElementById('issue-container');
    const countText = document.getElementById('issue-count-text');
    container.innerHTML = ""; 
    countText.innerText = `${issues.length} Issues`;

    issues.forEach(issue => {

        // Set top border color based on status

        const borderStyle = issue.status === 'open' ? 'border-t-green-400' : 'border-t-purple-400';
        
        // Dynamic priority badge colors


        let prioClass = "bg-gray-100 text-gray-500";
        if (issue.priority?.toLowerCase() === 'high') prioClass = "bg-red-50 text-red-500";
        else if (issue.priority?.toLowerCase() === 'medium') prioClass = "bg-orange-50 text-orange-400";




        // Assign status icon based on 'open' or 'closed'



        const statusIcon = issue.status === 'open' 
            ? './Images/Open-Status.png' 
            : './Images/Closed- Status .png'; 

        const card = document.createElement('div');
        card.className = `bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-t-4 ${borderStyle} cursor-pointer hover:shadow-md transition-all flex flex-col`;
        card.onclick = () => showDetails(issue.id); 
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="w-6 h-6">
                    <img src="${statusIcon}" class="w-full h-full object-contain" alt="status icon" onerror="this.src='https://via.placeholder.com/24?text=?'">
                </div>
                <span class="${prioClass} text-[10px] font-bold px-2 py-0.5 rounded uppercase">${issue.priority}</span>
            </div>
            
            <h3 class="font-bold text-gray-800 text-sm mb-2 line-clamp-2 h-10">${issue.title}</h3>
            <p class="text-gray-400 text-[11px] mb-4 line-clamp-2">${issue.description}</p>
            
            <div class="flex flex-wrap gap-2 mb-6 mt-auto">
                <span class="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                   <i class="fa-solid fa-bug"></i> BUG
                </span>
                <span class="bg-orange-50 text-orange-400 text-[10px]  font-bold px-2 py-1 rounded flex items-center gap-1">
                   <i class="fa-solid fa-circle-info"></i> HELP WANTED
                </span>
            </div>
            
            <div class="text-[10px] text-gray-400 border-t pt-3">
                <p>#${issue.id} by <span class="text-gray-600 font-semibold">${issue.author}</span></p>
                <p>${issue.createdAt}</p>
            </div>
        `;
        container.appendChild(card);
    });
}



/**
 * Filters the displayed issues by status (All, Open, Closed).
 * Updates the active tab styling and simulates a small delay for UX.
 */


function filterIssues(status) {
    const buttons = ['tab-all', 'tab-open', 'tab-closed'];
    buttons.forEach(id => document.getElementById(id).classList.remove('active-tab-btn'));
    document.getElementById(`tab-${status}`).classList.add('active-tab-btn');

    toggleLoader(true);

    setTimeout(() => {
        let filtered;
        if (status === 'all') filtered = allIssues;
        else filtered = allIssues.filter(i => i.status === status);
        
        displayIssues(filtered);
        toggleLoader(false);
    }, 400); 
}


/**
 * Searches for issues using the API search endpoint.
 * Syncs desktop and mobile search inputs.
 */


async function handleSearch(type) {
    const inputId = type === 'desktop' ? 'search-input' : 'search-input-mobile';
    const query = document.getElementById(inputId).value;
    
    // Sync the search text between mobile and desktop inputs


    const otherId = type === 'desktop' ? 'search-input-mobile' : 'search-input';
    const otherInput = document.getElementById(otherId);
    if(otherInput) otherInput.value = query;

    if(!query) return displayIssues(allIssues);
    
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${query}`);
    const data = await res.json();
    displayIssues(data.data);
}



/**
 * Fetches single issue details and opens a modal.
 */



async function showDetails(id) {
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
    const data = await res.json();
    const issue = data.data;

    // Inject data into the modal template


    document.getElementById('modal-content').innerHTML = `
        <h2 class="text-2xl font-bold text-gray-800 mb-2">${issue.title}</h2>
        <div class="flex items-center gap-3 mb-6">
            <span class="px-3 py-1 rounded-full text-xs font-bold ${issue.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}">● ${issue.status.toUpperCase()}</span>
            <span class="text-gray-400 text-sm">Opened by ${issue.author} • ${issue.createdAt}</span>
        </div>
        <p class="text-gray-600 leading-relaxed mb-8 border-t border-b py-6 text-sm">${issue.description}</p>
        <div class="grid grid-cols-2 gap-8">
            <div><p class="text-xs text-gray-400 mb-1 font-bold">Assignee</p><p class="font-semibold text-gray-700">${issue.author}</p></div>
            <div><p class="text-xs text-gray-400 mb-1 font-bold">Priority</p><span class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">${issue.priority}</span></div>
        </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
}


/**
 * Hides the issue detail modal.
 */


function closeModal() { 
    document.getElementById('modal').classList.add('hidden'); 
}



/**
 * Toggles visibility between the loading spinner and the data container.
 */


function toggleLoader(show) { 
    const loader = document.getElementById('loader');
    const container = document.getElementById('issue-container');
    if(loader) loader.classList.toggle('hidden', !show); 
    if(container) container.classList.toggle('hidden', show);
}
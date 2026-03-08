let allIssues = [];

// ১. লগইন ফাংশন
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

// ২. সার্ভার থেকে ডাটা ফেচ করা
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

// ৩. ডাটা ডিসপ্লে করা (ইমেজ ও আইকনসহ)
function displayIssues(issues) {
    const container = document.getElementById('issue-container');
    const countText = document.getElementById('issue-count-text');
    container.innerHTML = "";
    countText.innerText = `${issues.length} Issues`;

    issues.forEach(issue => {
        // স্ট্যাটাস অনুযায়ী টপ বর্ডার কালার
        const borderStyle = issue.status === 'open' ? 'border-t-green-400' : 'border-t-purple-400';
        
        // প্রায়োরিটি অনুযায়ী কালার সেট
        let prioClass = "bg-gray-100 text-gray-500";
        if (issue.priority?.toLowerCase() === 'high') prioClass = "bg-red-50 text-red-500";
        else if (issue.priority?.toLowerCase() === 'medium') prioClass = "bg-orange-50 text-orange-400";

        // স্ট্যাটাস অনুযায়ী আপনার দেওয়া ইমেজ পাথ
        const statusIcon = issue.status === 'open' 
            ? './Images/Open-Status.png' 
            : './Images/Closed- Status .png'; 

        const card = document.createElement('div');
        card.className = `bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-t-4 ${borderStyle} cursor-pointer hover:shadow-md transition-all flex flex-col`;
        card.onclick = () => showDetails(issue.id);
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <!-- স্ট্যাটাস ইমেজ -->
                <div class="w-6 h-6">
                    <img src="${statusIcon}" class="w-full h-full object-contain" alt="status icon" onerror="this.src='https://via.placeholder.com/24?text=?'">
                </div>
                <span class="${prioClass} text-[10px] font-bold px-2 py-0.5 rounded uppercase">${issue.priority}</span>
            </div>
            
            <h3 class="font-bold text-gray-800 text-sm mb-2 line-clamp-2 h-10">${issue.title}</h3>
            <p class="text-gray-400 text-[11px] mb-4 line-clamp-2">${issue.description}</p>
            
            <div class="flex flex-wrap gap-2 mb-6 mt-auto">
                <!-- BUG ট্যাগ (ডট ছাড়া) -->
                <span class="bg-red-50 text-red-500 text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1">
                   <i class="fa-solid fa-bug"></i> BUG
                </span>
                <!-- HELP WANTED ট্যাগ -->
                <span class="bg-orange-50 text-orange-400 text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1">
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

// ৪. ফিল্টার ফাংশন
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

// ৫. সার্চ ফাংশন
async function handleSearch(type) {
    const inputId = type === 'desktop' ? 'search-input' : 'search-input-mobile';
    const query = document.getElementById(inputId).value;
    
    const otherId = type === 'desktop' ? 'search-input-mobile' : 'search-input';
    const otherInput = document.getElementById(otherId);
    if(otherInput) otherInput.value = query;

    if(!query) return displayIssues(allIssues);
    
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${query}`);
    const data = await res.json();
    displayIssues(data.data);
}

// ৬. মডাল ডিটেইলস
async function showDetails(id) {
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
    const data = await res.json();
    const issue = data.data;

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
        <div class="mt-8 text-right">
            <button onclick="closeModal()" class="bg-gray-100 text-gray-600 px-6 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors">Close</button>
        </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
}

// ৭. ইউটিলিটি ফাংশন
function closeModal() { 
    document.getElementById('modal').classList.add('hidden'); 
}

function toggleLoader(show) { 
    const loader = document.getElementById('loader');
    const container = document.getElementById('issue-container');
    if(loader) loader.classList.toggle('hidden', !show); 
    if(container) container.classList.toggle('hidden', show);
}
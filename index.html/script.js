// DOM 요소
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginPage = document.getElementById('loginPage');
const signupPage = document.getElementById('signupPage');
const mainContent = document.getElementById('mainContent');
const adminPanel = document.getElementById('adminPanel');
const userList = document.getElementById('userList');
const inquiryList = document.getElementById('inquiryList');

// 이메일 도메인 선택
function updateEmailDomain() {
    const emailId = document.getElementById('emailId').value;
    const domainSelect = document.getElementById('emailDomain');
    const customDomain = document.getElementById('customDomain');
    const email = document.getElementById('email');
    
    if (domainSelect.value === 'custom') {
        customDomain.style.display = 'block';
        email.value = emailId + '@' + customDomain.value;
    } else {
        customDomain.style.display = 'none';
        email.value = emailId + '@' + domainSelect.value;
    }
}

// 사용자 정보 팝업 토글
function toggleUserPopup() {
    const popup = document.getElementById('userPopup');
    popup.classList.toggle('show');
}

// 페이지 이탈 경고
let formChanged = false;

function checkFormChanges() {
    const inputs = signupForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            formChanged = true;
        });
    });
}

window.addEventListener('beforeunload', (e) => {
    if (formChanged) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// 회원가입
function signup(event) {
    event.preventDefault();
    
    const id = document.getElementById('signupId').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('signupPassword').value;
    const email = document.getElementById('email').value;
    const birth = document.getElementById('birth').value;
    const gender = document.getElementById('gender').value;
    const address = document.getElementById('address').value;
    
    // ID 중복 체크
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.id === id)) {
        alert('이미 사용 중인 ID입니다.');
        return;
    }
    
    // 비밀번호 유효성 검사
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        alert('비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.');
        return;
    }
    
    // 사용자 정보 저장
    const user = {
        id,
        username,
        password,
        email,
        birth,
        gender,
        address
    };
    
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('회원가입이 완료되었습니다.');
    showLoginPage();
}

// 로그인
function login(event) {
    event.preventDefault();
    
    const id = document.getElementById('loginId').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === id && u.password === password);
    
    if (user) {
        // 세션 정보 저장
        sessionStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            username: user.username,
            isAdmin: false
        }));
        
        showMainContent();
    } else {
        alert('ID 또는 비밀번호가 일치하지 않습니다.');
    }
}

// 관리자 로그인
function adminLogin() {
    const adminId = prompt('관리자 ID를 입력하세요:');
    const adminPassword = prompt('관리자 비밀번호를 입력하세요:');
    
    if (adminId === 'admin' && adminPassword === 'admin1234') {
        // 관리자 세션 정보 저장
        sessionStorage.setItem('currentUser', JSON.stringify({
            id: 'admin',
            username: '관리자',
            isAdmin: true
        }));
        
        showMainContent();
    } else {
        alert('관리자 인증에 실패했습니다.');
    }
}

// 로그아웃
function logout() {
    sessionStorage.removeItem('currentUser');
    showLoginPage();
}

// 계정 삭제
function deleteAccount() {
    if (confirm('정말로 계정을 삭제하시겠습니까?')) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        const updatedUsers = users.filter(user => user.id !== currentUser.id);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        sessionStorage.removeItem('currentUser');
        showLoginPage();
    }
}

// 페이지 전환 함수
function showLoginPage() {
    loginPage.style.display = 'block';
    signupPage.style.display = 'none';
    mainContent.style.display = 'none';
    document.getElementById('loginForm').reset();
}

function showSignupPage() {
    loginPage.style.display = 'none';
    signupPage.style.display = 'block';
    mainContent.style.display = 'none';
    document.getElementById('signupForm').reset();
    formChanged = false;
}

function showMainContent() {
    loginPage.style.display = 'none';
    signupPage.style.display = 'none';
    mainContent.style.display = 'block';
    
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('userDisplay').textContent = currentUser.username;
        document.getElementById('userDisplay').style.display = 'block';
        
        if (currentUser.isAdmin) {
            adminPanel.style.display = 'block';
            loadAdminData();
        } else {
            adminPanel.style.display = 'none';
        }
    }
}

// 관리자 데이터 로드
function loadAdminData() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const inquiries = JSON.parse(localStorage.getItem('inquiries')) || [];
    
    // 사용자 목록 표시
    userList.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.birth}</td>
            <td>${user.gender}</td>
            <td>${user.address}</td>
            <td>
                <button class="admin-btn edit-btn" onclick="editUser('${user.id}')">수정</button>
                <button class="admin-btn delete-btn" onclick="deleteUser('${user.id}')">삭제</button>
            </td>
        </tr>
    `).join('');
    
    // 문의 목록 표시
    inquiryList.innerHTML = inquiries.map(inquiry => `
        <tr>
            <td>${inquiry.id}</td>
            <td>${inquiry.userId}</td>
            <td>${inquiry.title}</td>
            <td>${inquiry.content}</td>
            <td>${inquiry.date}</td>
            <td>${inquiry.status}</td>
            <td>
                <button class="admin-btn edit-btn" onclick="editInquiry('${inquiry.id}')">수정</button>
                <button class="admin-btn delete-btn" onclick="deleteInquiry('${inquiry.id}')">삭제</button>
            </td>
        </tr>
    `).join('');
}

// 사용자 수정
function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    
    if (user) {
        const newUsername = prompt('새 사용자 이름:', user.username);
        const newEmail = prompt('새 이메일:', user.email);
        const newAddress = prompt('새 주소:', user.address);
        
        if (newUsername && newEmail && newAddress) {
            user.username = newUsername;
            user.email = newEmail;
            user.address = newAddress;
            
            localStorage.setItem('users', JSON.stringify(users));
            loadAdminData();
            alert('사용자 정보가 수정되었습니다.');
        }
    }
}

// 사용자 삭제
function deleteUser(userId) {
    if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const updatedUsers = users.filter(user => user.id !== userId);
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        loadAdminData();
        alert('사용자가 삭제되었습니다.');
    }
}

// 문의 수정
function editInquiry(inquiryId) {
    const inquiries = JSON.parse(localStorage.getItem('inquiries')) || [];
    const inquiry = inquiries.find(i => i.id === inquiryId);
    
    if (inquiry) {
        const newStatus = prompt('새 상태 (대기/처리중/완료):', inquiry.status);
        
        if (newStatus) {
            inquiry.status = newStatus;
            localStorage.setItem('inquiries', JSON.stringify(inquiries));
            loadAdminData();
            alert('문의 상태가 수정되었습니다.');
        }
    }
}

// 문의 삭제
function deleteInquiry(inquiryId) {
    if (confirm('정말로 이 문의를 삭제하시겠습니까?')) {
        const inquiries = JSON.parse(localStorage.getItem('inquiries')) || [];
        const updatedInquiries = inquiries.filter(inquiry => inquiry.id !== inquiryId);
        
        localStorage.setItem('inquiries', JSON.stringify(updatedInquiries));
        loadAdminData();
        alert('문의가 삭제되었습니다.');
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    checkFormChanges();
    
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        showMainContent();
    } else {
        showLoginPage();
    }
}); 
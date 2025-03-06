document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 폰트 크기 조절 관련 변수
    const decreaseFontBtn = document.getElementById('decreaseFontSize');
    const resetFontBtn = document.getElementById('resetFontSize');
    const increaseFontBtn = document.getElementById('increaseFontSize');
    const DEFAULT_FONT_SIZE = 16;
    const FONT_SIZE_STEP = 2;
    const MIN_FONT_SIZE = 12;
    const MAX_FONT_SIZE = 24;
    
    // 저장된 폰트 크기 불러오기
    let currentFontSize = parseInt(localStorage.getItem('fontSize')) || DEFAULT_FONT_SIZE;
    document.documentElement.style.setProperty('--font-size-base', `${currentFontSize}px`);

    // 폰트 크기 조절 함수
    function changeFontSize(newSize) {
        if (newSize >= MIN_FONT_SIZE && newSize <= MAX_FONT_SIZE) {
            currentFontSize = newSize;
            document.documentElement.style.setProperty('--font-size-base', `${currentFontSize}px`);
            localStorage.setItem('fontSize', currentFontSize);
        }
    }

    // 폰트 크기 조절 버튼 이벤트
    decreaseFontBtn.addEventListener('click', () => {
        changeFontSize(currentFontSize - FONT_SIZE_STEP);
    });

    resetFontBtn.addEventListener('click', () => {
        changeFontSize(DEFAULT_FONT_SIZE);
    });

    increaseFontBtn.addEventListener('click', () => {
        changeFontSize(currentFontSize + FONT_SIZE_STEP);
    });

    // 로컬 스토리지에서 테마 설정 불러오기
    const currentTheme = localStorage.getItem('theme');
    
    // 저장된 테마가 있거나 시스템이 다크모드인 경우 다크모드 적용
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.textContent = '☀️ 라이트모드';
    }
    
    // 다크모드 토글 버튼 클릭 이벤트
    darkModeToggle.addEventListener('click', () => {
        let theme = 'light';
        
        if (document.documentElement.getAttribute('data-theme') !== 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            theme = 'dark';
            darkModeToggle.textContent = '☀️ 라이트모드';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            darkModeToggle.textContent = '🌙 다크모드';
        }
        
        // 선택한 테마를 로컬 스토리지에 저장
        localStorage.setItem('theme', theme);
    });

    // 일기 관련 기능
    const diaryForm = document.getElementById('diary-form');
    const diaryList = document.getElementById('diaryList');
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('nav a');
    const backToListBtn = document.getElementById('backToList');

    // 섹션 전환 함수
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(`${sectionId}-section`).classList.remove('hidden');

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
    }

    // 네비게이션 이벤트
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
            if (section === 'list') {
                renderDiaryList();
            }
        });
    });

    // 일기 저장 함수
    function saveDiary(diary) {
        const diaries = getDiaries();
        diary.id = Date.now(); // 고유 ID 생성
        diaries.push(diary);
        localStorage.setItem('diaries', JSON.stringify(diaries));
    }

    // 저장된 일기 불러오기 함수
    function getDiaries() {
        const diaries = localStorage.getItem('diaries');
        return diaries ? JSON.parse(diaries) : [];
    }

    // 일기 목록 렌더링 함수
    function renderDiaryList() {
        const diaries = getDiaries();
        diaryList.innerHTML = '';
        
        diaries.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(diary => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="diary-item-title">${diary.title}</div>
                <div class="diary-item-date">${formatDate(diary.date)}</div>
            `;
            li.addEventListener('click', () => showDiary(diary));
            diaryList.appendChild(li);
        });
    }

    // 일기 상세 보기 함수
    function showDiary(diary) {
        document.getElementById('viewTitle').textContent = diary.title;
        document.getElementById('viewDate').textContent = formatDate(diary.date);
        document.getElementById('viewContent').textContent = diary.content;
        showSection('view');
    }

    // 날짜 포맷 함수
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ko-KR', options);
    }

    // 폼 제출 이벤트
    diaryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const diary = {
            title: diaryForm.title.value,
            date: diaryForm.date.value,
            content: diaryForm.content.value
        };
        
        saveDiary(diary);
        diaryForm.reset();
        showSection('list');
        renderDiaryList();
    });

    // 목록으로 돌아가기 버튼
    backToListBtn.addEventListener('click', () => {
        showSection('list');
        renderDiaryList();
    });

    // 초기 섹션 설정
    showSection('write');
}); 
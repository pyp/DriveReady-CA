document.addEventListener("DOMContentLoaded", function () {
    validateJwt();
    
    initializeNavigation();
    initializeSidebarCollapse();
    initializeTestsDropdown();
    initializeLessonsDropdown();
    initializeLessonFilter();
    initializeLogoutButton();

    bindQuestionNavigation();
    fetchDashboard();
});

let currentQuestionIndex = 0;
let questions = [];

let currentLessonIndex = 0;
let lessons = [];

let currentTestId = 0;
let selectedAnswers = {};

let tests = [];

function bindQuestionNavigation() {
    document.querySelector('.next-question').addEventListener('click', nextQuestion);
    document.querySelector('.prev-question').addEventListener('click', previousQuestion);

    document.querySelector('.next-lesson').addEventListener('click', nextLesson);
    document.querySelector('.prev-lesson').addEventListener('click', previousLesson);

    document.querySelector('.go-to-lesson-button').style.display = 'none';
}

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.sidebar ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const sectionId = this.getAttribute('href').substring(1);
            hideQuestions();
            hideLessons();
            hideTests();
            
            showSection(sectionId, true);
            setActiveLink(this);
        });
    });
}


function initializeLessonsInteraction() {
    const lessons = document.querySelectorAll("#lessons tbody tr");
    lessons.forEach(row => {
        row.addEventListener("click", function() {
            const lessonId = this.cells[0].innerText;
            fetchLesson(lessonId); 
        });
    });
}

function initializeTestsInteraction() {
    const testRows = document.querySelectorAll("#tests tbody tr");
    testRows.forEach(row => {
        row.addEventListener("click", function() {
            const testId = this.cells[0].innerText;
            fetchTestQuestions(testId); 
        });
    });
}


function initializeSidebarCollapse() {
    const collapseButton = document.querySelector('#collapse');
    const sidebar = document.querySelector('.sidebar-container');
    collapseButton.addEventListener('click', function () {
        toggleSidebar(sidebar, this);
    });
}


function initializeLogoutButton() {
    const logoutButton = document.querySelector('#logout a');
    logoutButton.addEventListener('click', function (e) {
        e.preventDefault();
        redirectToLogin();
    });
}


function showSection(sectionId, load) {
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
        if (section.id === sectionId) {
            showLoader(sectionId);
            const contentContainer = section.querySelector('.dash-container') || section.querySelector('.lessons-container') || section.querySelector('.tests-container');
            if (contentContainer) {
                contentContainer.style.display = 'none';
            } 

            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });

    if (load) {
        if (sectionId === 'dashboard') {
            loadDashboard();
        } else if (sectionId === 'lessons') {
            fetchLessons();
        } else if (sectionId === 'tests') {
            fetchTests();
        }
    }
}


function loadDashboard() {
    setTimeout(() => {
        const sections = document.querySelectorAll('#dashboard');
        if (sections.length > 1) {
            const dashboardSection = sections[1];
            const dashContainer = dashboardSection.querySelector('.dash-container');
            console.log('Dashboard container:', dashContainer);
            if (dashContainer) {
                dashContainer.style.display = 'block';
            } else {
                console.error('Dashboard container element not found');
            }
            fetchDashboard();
            hideLoader('dashboard');
        } else {
            console.error('Dashboard section element not found');
        }
    }, 1000);
}


function setActiveLink(selectedLink) {
    const links = document.querySelectorAll('.sidebar ul li a');
    links.forEach(link => {
        link.parentNode.classList.remove('active');
    });
    selectedLink.parentNode.classList.add('active');
}

function animateRows(sectionId) {
    const tableRows = document.querySelectorAll(`#${sectionId} tbody tr`);
    tableRows.forEach((row, index) => {
        setTimeout(() => {
            row.classList.add("show");
        }, index * 100);
    });
    
}

function toggleSidebar(sidebar, button) {
    sidebar.classList.toggle('sidebar-collapsed');
    const icon = button.querySelector('i');
    icon.classList.toggle('fa-arrow-left');
    icon.classList.toggle('fa-arrow-right');
}

function displayLesson(lesson) {
    const lessonsContainer = document.querySelector(".lessons-container");
    const informationContent = document.querySelector(".information-container");
    lessonsContainer.style.display = "none";
    informationContent.style.display = "block";

    putLessonData(lesson.ID)
    updateLessonHeader(lesson.ID, lesson);
    updateLessonNavigationState(lesson.ID);
    
    updateTestButton(); 
}


function displayTestQuestions(lesson) {
    const testContainer = document.querySelector(".tests-container");
    const questionsContent = document.querySelector(".questions-content");
    testContainer.style.display = "none";
    questionsContent.style.display = "block";
    updateQuestionHeader(lesson.ID, lesson.questions, lesson.selectedAnswers);
    updateQuestionCounter(); 
}

function hideQuestions() {
    const testContainer = document.querySelector(".tests-container");
    const questionsContent = document.querySelector(".questions-content");
    testContainer.style.display = "block";
    questionsContent.style.display = "none";
}

function hideLessons() {
    const lessonsContainer = document.querySelector(".lessons-container");
    const informationContent = document.querySelector(".information-container");
    lessonsContainer.style.display = "block";
    informationContent.style.display = "none";
}


function hideTests() {
    const testsContainer = document.querySelector(".tests-container");
    if (testsContainer) {
        testsContainer.style.display = "none";
    }
}

function updateQuestionHeader(lessonId, lessonQuestions, lessonSelectedAnswers) {
    const questionHeader = document.querySelector(".question-header h3");
    questionHeader.textContent = `Test ${lessonId}`;
    currentTestId = parseInt(lessonId);
    currentQuestionIndex = 0;
    selectedAnswers = lessonSelectedAnswers || {};  // Store the selected answers
    questions = lessonQuestions.map(q => ({
        id: q.id,
        question: q.question,
        answers: q.answers,
        correctAnswer: q.correctAnswer,
        explanations: q.explanations,
        userAnswer: selectedAnswers[q.id] || null,
        answered: !!selectedAnswers[q.id]
    }));
    loadQuestion(currentQuestionIndex);
    updateQuestionCounter();
}

function updateLessonHeader(lessonId, lessonContent) {
    const lessonHeader = document.querySelector(".information-header h3");
    lessonHeader.textContent = `Lesson ${lessonId}`;

    const informationContainer = document.querySelector('.information-container');
    const informationContent = informationContainer.querySelector('.information-content');
    informationContent.innerHTML = ''; 

    let ul = null;  

    lessonContent.information.forEach(block => {
        if (block.type !== 'bullet' && ul !== null) {
            ul = null;
        }

        switch (block.type) {
            case 'text':
                const p = document.createElement('p');
                p.textContent = block.content;
                informationContent.appendChild(p);
                break;

            case 'bold':
                const b = document.createElement('b');
                b.textContent = block.content;
                informationContent.appendChild(b);
                break;

            case 'title':
                const h2 = document.createElement('h2');
                h2.textContent = block.content;
                informationContent.appendChild(h2);
                break;

            case 'underline':
                const u = document.createElement('u');
                u.style.fontWeight = 'bold';
                u.textContent = block.content;
                informationContent.appendChild(u);
                break;

            case 'bullet':
                const li = document.createElement('li');
                const parts = block.content.split(':');

                if (parts.length > 1) {
                    const boldSpan = document.createElement('span');
                    boldSpan.style.fontWeight = 'bold';
                    boldSpan.textContent = parts[0] + ':';
                    li.appendChild(boldSpan);
                    li.appendChild(document.createTextNode(parts.slice(1).join(':')));
                } else {
                    li.textContent = block.content;
                }

                if (!ul) {
                    ul = document.createElement('ul');
                    informationContent.appendChild(ul);
                }

                ul.appendChild(li);
                break;
            case 'image':
                const img = document.createElement('img');
                img.src = block.src;
                img.style.marginRight = '15px';
                img.style.borderRadius = '15px';
                img.style.display = 'block';
                img.style.transition = 'transform 0.3s ease-in-out, top 0.3s ease-in-out, left 0.3s ease-in-out';
                img.style.cursor = 'pointer';
                img.style.transformOrigin = 'center center'; // Always scale from the center
                
                const imgContainer = document.createElement('div');
                imgContainer.style.marginBottom = '20px';
                imgContainer.style.position = 'relative';
                imgContainer.style.overflow = 'hidden';
                
                // Create overlay
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100vw';
                overlay.style.height = '100vh';
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                overlay.style.zIndex = '999';
                overlay.style.display = 'none';
                overlay.style.cursor = 'pointer';
                document.body.appendChild(overlay);
                
                img.addEventListener('click', () => {
                    const isExpanded = imgContainer.classList.toggle('expanded');
                
                    if (isExpanded) {
                        const scaleFactor = window.innerWidth < 768 ? 1.3 : 3; // Scale factor for mobile vs. desktop
                        img.style.position = 'fixed'; // Fixed position to keep it centered
                        img.style.top = '50%'; // Vertically center
                        //img.style.left = '50%'; // Horizontally center
                        img.style.transformOrigin = 'center center'; // Ensure scaling happens from the center
                        img.style.zIndex = '1000'; // Bring the image to the front
                        overlay.style.display = 'block'; // Show the overlay
                        
                        // Animate the scaling separately
                        setTimeout(() => {
                            img.style.transition = 'transform 0.3s ease-in-out'; // Transition for scaling
                            img.style.transform = `scale(${scaleFactor})`; // Apply scaling after positioning
                        }, 0);
                    } else {
                        // Reset the image to its original size and position
                        img.style.position = 'relative';
                        img.style.top = '0';
                        img.style.left = '0';
                        img.style.transform = 'scale(1)'; // Reset scale
                        img.style.zIndex = '1';
                        overlay.style.display = 'none';
                    }
                });
                
                // Close expanded view by clicking the overlay
                overlay.addEventListener('click', () => {
                    imgContainer.classList.remove('expanded');
                    img.style.transform = 'scale(1)';
                    img.style.zIndex = '1';
                    img.style.position = 'static';
                    overlay.style.display = 'none';
                });
            
                imgContainer.appendChild(img);
            
                if (block.description) {
                    const imgDesc = document.createElement('p');
                    imgDesc.textContent = block.description;
                    imgContainer.appendChild(imgDesc);
                } else {
                    img.style.maxWidth = '250px';
                }
            
                informationContent.appendChild(imgContainer);
                break;       
        }
    });

    informationContainer.style.display = 'block';  
}


function loadQuestion(index) {
    const question = questions[index];
    const questionTitle = document.querySelector('.question-title p');
    questionTitle.textContent = question.question;

    const answersList = document.querySelector('.questions-list');
    answersList.innerHTML = '';  // Clear previous answers

    question.answers.forEach((answer, idx) => {
        const answerContainer = document.createElement('div');
        answerContainer.className = 'answer-container';

        const li = document.createElement('li');
        li.textContent = answer;
        li.setAttribute('id', `answer-${idx}`);
        li.onclick = () => selectItem(li);

        const explanationDiv = document.createElement('div');
        explanationDiv.setAttribute('id', `explanation-${idx}`);
        explanationDiv.className = 'explanation';
        explanationDiv.textContent = question.explanations[idx.toString()];  // Access explanation by index string
        explanationDiv.style.display = 'none';  // Initially hide the explanation

        answerContainer.appendChild(li);
        answerContainer.appendChild(explanationDiv);
        answersList.appendChild(answerContainer);

        // Check if the current answer is the user's answer
        if (selectedAnswers[question.id] === answer) {
            li.classList.add('selected');
            explanationDiv.style.display = 'block';  // Show explanation
            question.answered = true;
            if (answer === question.correctAnswer) {
                li.style.border = '2px solid green';  // Correct answer
            } else {
                li.style.border = '2px solid red';  // Incorrect answer
            }
        }

        // Disable further clicks if the question has been answered
        if (question.answered) {
            li.style.pointerEvents = "none"; // Disable further clicks
            explanationDiv.style.display = 'block';  // Show explanation
            
            
            if (answer === question.correctAnswer) {
                li.classList.add('correct');  // Correct answer
                li.style.border = '2px solid green';  // Correct answer
            } else {
                li.classList.add('incorrect');  // Correct answer
                li.style.border = '2px solid red';  // Incorrect answer
            }
        }
    });

    updateNavigationState();
    updateQuestionCounter();
}

function nextLesson() {
    if (currentLessonIndex < lessons.length - 1) {
        currentLessonIndex++;
        displayLesson(lessons[currentLessonIndex]);
        updateTestButton(); 
    }
}

function previousLesson() {
    if (currentLessonIndex > 0) {
        currentLessonIndex--;
        displayLesson(lessons[currentLessonIndex]);
        updateTestButton(); 
    }
}

function nextQuestion() {
    if (!questions[currentQuestionIndex].answered) {
        showWarning("Please answer the question before proceeding.");
        return;  
    }

    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    }

    updateNavigationState();
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
        updateNavigationState();
    }
}

function closeQuestions() {
    const testsContainer = document.querySelector(".tests-container");
    const questionsContent = document.querySelector(".questions-content");
    testsContainer.style.display = "block";
    questionsContent.style.display = "none";

    showLoader('tests');
    fetchTests();
}

function closeLesson() {
    const lessonsContainer = document.querySelector(".lessons-container");
    const informationContent = document.querySelector(".information-container");
    lessonsContainer.style.display = "block";
    informationContent.style.display = "none";

    showLoader('lessons');
    fetchLessons();
}


async function validateJwt() {
    try {
        const response = await fetch("https://driveready.org/api/jwt", {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('jwt')
            }
        });
        
        if (!response.ok) { 
            redirectToLogin();
            return
        }
    } catch (error) {
        console.error('Error validating JWT token:', error);
    }
}

async function fetchLesson(lessonId) {
    try {
        const response = await fetch(`https://driveready.org/api/lessons/${lessonId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('jwt')
            }
        });

        if (response.ok) {
            const lesson = await response.json();
            console.log("found lesson", lesson);
            displayLesson(lesson);
        } else {
            const errorData = await response.json();
            if (errorData.error === "Invalid or expired JWT token.") {
                redirectToLogin();
                return;
            } else {
                console.error('Error:', errorData.error);
            }
        }
    } catch (error) {
        console.error('Error fetching lesson questions:', error);
    }
}


async function fetchTestQuestions(lessonId) {
    try {
        const response = await fetch(`https://driveready.org/api/tests/${lessonId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('jwt')
            }
        });

        if (response.ok) {
            const lesson = await response.json();
            displayTestQuestions(lesson);
        } else {
            const errorData = await response.json();
            if (errorData.error = "Invalid or expired JWT token." ) {
                redirectToLogin();
                return
            }
        }
    } catch (error) {
        console.error('Error fetching lesson questions:', error);
    }
}

async function putTestData(lessonId, questionId, userAnswer) {
    const payload = {
        lessonId: lessonId,
        question: questionId,
        userAnswer: userAnswer
    };

    try {
        const response = await fetch(`https://driveready.org/api/tests`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('jwt')
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
        } else {
            const errorData = await response.json();

            if (errorData.error = "Invalid or expired JWT token." ) {
                redirectToLogin();
                return
            }
            
            showWarning("Error: " + (errorData.error || "An error occurred while updating lesson data."));
        }
    } catch (error) {
        showWarning("Error: " + error.message);
    }
}

async function putLessonData(lessonId) {
    const payload = {
        lessonId: lessonId,
    };

    try {
        const response = await fetch(`https://driveready.org/api/lessons`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('jwt')
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
        } else {
            const errorData = await response.json();

            if (errorData.error = "Invalid or expired JWT token." ) {
                redirectToLogin();
                return
            }
            
            showWarning("Error: " + (errorData.error || "An error occurred while updating lesson data."));
        }
    } catch (error) {
        showWarning("Error: " + error.message);
    }
}

function updateTestButton() {
    const testButton = document.querySelector('.take-test-button');
    const currentLesson = lessons[currentLessonIndex];
    
    const testLessons = [
        '1C',
        '2E',
        '3E',
        '4D',
        '5D',
        '6C',
        '7D',
        '8D',
        '9E',
        '10D',
        '11D',
        '12E',
        '13F',
        '14D',
        '15C'

    ];

    const newTestButton = testButton.cloneNode(true);
    testButton.parentNode.replaceChild(newTestButton, testButton);

    for (let i = 0; i < testLessons.length; i++) {
        if (testLessons[i] == currentLesson.ID) {
            const lessonNumber = currentLesson.ID.split(/[^0-9]/)[0];

            newTestButton.style.display = 'block';
            newTestButton.textContent = `Take Lesson ${lessonNumber} Test`;

            newTestButton.addEventListener('click', function(event) {
                event.preventDefault();
                navigateToTest(lessonNumber);
            });
            return;
        } else {
            newTestButton.style.display = 'none';
        }
    }
}

function updateGoToLessonButton() {
    const goToLessonButton = document.querySelector('.go-to-lesson-button');
    const nextLessonId = `${currentTestId + 1}A`;

    if (currentTestId === 16) {
        return
    }

    goToLessonButton.style.display = 'block';
    goToLessonButton.textContent = `Go To Lesson ${nextLessonId}`;

    const newGoToLessonButton = goToLessonButton.cloneNode(true);
    goToLessonButton.parentNode.replaceChild(newGoToLessonButton, goToLessonButton);

    newGoToLessonButton.addEventListener('click', function(event) {
        event.preventDefault();
        newGoToLessonButton.style.display = 'none';
        console.log(nextLessonId);
        navigateToLesson(nextLessonId);
    });
}

function navigateToTest(lessonNumber) {
    showLoader('tests');
    hideTests();

    fetchTestQuestions(lessonNumber)
        .then(() => {
            showSection('tests', false);
            setActiveLink(document.querySelector('a[href="#tests"]'));
        })
        .catch((error) => {
            console.error('Error fetching test questions:', error);
        })
        .finally(() => {
            hideLoader('tests');
        });
}

function navigateToLesson(lessonNumber) {
    showLoader('lessons');
    hideLessons();

    fetchLesson(lessonNumber)
        .then(() => {
            showSection('lessons', false);
            setActiveLink(document.querySelector('a[href="#lessons"]'));
        })
        .catch((error) => {
            console.error('Error fetching lesson:', error);
        })
        .finally(() => {
            hideLoader('lessons');
        });
}

function updateQuestionCounter() {
    const counter = document.querySelector('.question-counter');
    counter.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
}

function updateLessonNavigationState(lessonId) {
    const nextButton = document.querySelector('.next-lesson');
    const prevButton = document.querySelector('.prev-lesson');

    for (var i = 0; i < lessons.length; i++) {
        if (lessonId == lessons[i].ID) {
            currentLessonIndex = i
            break
        }
    }

    if (currentLessonIndex >= lessons.length - 1) {
        nextButton.classList.add('button-disabled');
        nextButton.classList.remove('button-enabled');
    } else {
        nextButton.classList.remove('button-disabled');
        nextButton.classList.add('button-enabled');
    }

    if (currentLessonIndex <= 0) {
        prevButton.classList.add('button-disabled');
        prevButton.classList.remove('button-enabled');
    } else {
        prevButton.classList.remove('button-disabled');
        prevButton.classList.add('button-enabled');
    }
}

function updateNavigationState() {
    const nextButton = document.querySelector('.next-question');
    const prevButton = document.querySelector('.prev-question');

    if (currentQuestionIndex >= questions.length - 1 || !questions[currentQuestionIndex].answered) {
        nextButton.classList.add('button-disabled');
        nextButton.classList.remove('button-enabled');
    } else {
        nextButton.classList.remove('button-disabled');
        nextButton.classList.add('button-enabled');
    }

    if (currentQuestionIndex <= 0) {
        prevButton.classList.add('button-disabled');
        prevButton.classList.remove('button-enabled');
    } else {
        prevButton.classList.remove('button-disabled');
        prevButton.classList.add('button-enabled');
    }
}

function selectItem(selectedLi) {
    selectedLi.classList.add('selected');

    const question = questions[currentQuestionIndex];
    question.userAnswer = selectedLi.textContent;
    question.answered = true;

    const allContainers = document.querySelectorAll('.answer-container');

    // Post lesson data
    const lessonId = document.querySelector(".question-header h3").textContent.split(' ')[1]; // Extract lesson ID from header

    putTestData(lessonId, question.question, question.userAnswer); // Post data

    allContainers.forEach(container => {
        const li = container.firstChild;
        const explanationDiv = container.lastChild;

        li.style.pointerEvents = "none"; // Disable further clicks
        explanationDiv.style.display = 'block'; // Show explanation

        if (li.textContent === question.correctAnswer) {
            li.style.border = '2px solid #4CAF50'; // Correct answer
            if (li === selectedLi) {
                selectedLi.classList.add('correct');
            }
        } else {
            li.style.border = '2px solid #F44336'; // Incorrect answer
            if (li === selectedLi) {
                selectedLi.classList.add('incorrect');
            }
        }
    });

    if (selectedLi.textContent === question.correctAnswer) {
        runConfetti();
        playCorrect();
    }

    if (currentQuestionIndex === questions.length - 1) {
        playComplete();
        updateGoToLessonButton();
    }

    updateNavigationState();
}


function runConfetti() {
    const questionContainer = document.querySelector('.question-container');

    const origin = {
        x: (questionContainer.getBoundingClientRect().left + questionContainer.offsetWidth / 2) / window.innerWidth,
        y: (questionContainer.getBoundingClientRect().top + questionContainer.offsetHeight / 2) / window.innerHeight + 0.3
    };

    confetti({
        particleCount: 100,
        spread: 70,
        origin: origin
    });
}

function playCorrect() {
    var audio = new Audio('/audio/correct.mp3');
    audio.play();
}

function playComplete() {
    showWarning(`Great Job! You completed this lesson!`)
    var audio = new Audio('/audio/completed.mp3');
    audio.play();
}

function showWarning(message) {
    const warningElement = document.querySelector('.warning');
    warningElement.textContent = message;
    warningElement.style.visibility = 'visible';
    warningElement.style.opacity = '0'; 

    warningElement.style.animation = 'slideUpAndDown2 5s ease forwards';

    setTimeout(() => {
        warningElement.style.visibility = 'hidden';
        warningElement.style.animation = 'none';
    }, 3000);
}

function showLoader(sectionId) {
    const sections = document.querySelectorAll(`#${sectionId}`);
    if (sections.length > 1) {
        const loader = sections[1].querySelector('.loader');
        if (loader) {
            loader.style.display = 'flex';
        } else {
            console.error(`Loader element not found for section: ${sectionId}`);
        }
    } else {
        console.error(`Section element not found: ${sectionId}`);
    }
}

function hideLoader(sectionId) {
    const sections = document.querySelectorAll(`#${sectionId}`);
    if (sections.length > 1) {
        const loader = sections[1].querySelector('.loader');
        if (loader) {
            loader.style.display = 'none';
        } else {
            console.error(`Loader element not found for section: ${sectionId}`);
        }
    } else {
        console.error(`Section element not found: ${sectionId}`);
    }
}

function hideWarning() {
    const warningElement = document.querySelector('.warning');
    warningElement.style.display = 'none'; 
}

function searchTableTests() {
    const input = document.getElementById('searchInputTests').value.toLowerCase();
    const rows = document.querySelectorAll("#tests tbody tr");
    rows.forEach(row => {
        const isVisible = row.textContent.toLowerCase().includes(input);
        row.style.display = isVisible ? '' : 'none';
    });
}

function searchTableLessons() {
    const input = document.getElementById('searchInputLessons').value.toLowerCase();
    const rows = document.querySelectorAll("#lessons tbody tr");
    rows.forEach(row => {
        const isVisible = row.textContent.toLowerCase().includes(input);
        row.style.display = isVisible ? '' : 'none';
    });
}

function filterTableTests(status) {
    const rows = document.querySelectorAll("#tests tbody tr");
    rows.forEach(row => {
        const statusText = row.querySelector('.status').textContent.toLowerCase();
        const isVisible = status === 'All' || statusText.includes(status.toLowerCase());
        row.style.display = isVisible ? '' : 'none';
    });
}

function filterAndSortTableLessons(criteria) {
    const rows = Array.from(document.querySelectorAll("#lessons tbody tr"));
    const tbody = document.querySelector("#lessons tbody");

    rows.sort((a, b) => {
        const dateA = new Date(a.querySelector('td:nth-child(4)').textContent);
        const dateB = new Date(b.querySelector('td:nth-child(4)').textContent);
        if (criteria === 'Latest') {
            return dateB - dateA;
        } else if (criteria === 'Oldest') {
            return dateA - dateB;
        } else {
            return 0; 
        }
    });

    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}

function populateTestsTable(tests) {
    tests.sort((a, b) => a.ID - b.ID);

    const tbody = document.querySelector("#tests tbody");
    tbody.innerHTML = ''; 

    tests.forEach(test => {
        const row = document.createElement("tr");

        // Lesson ID
        const lessonIdCell = document.createElement("td");
        lessonIdCell.textContent = test.ID;
        row.appendChild(lessonIdCell);

        // Lesson Name
        const lessonNameCell = document.createElement("td");
        lessonNameCell.textContent = test.name;
        row.appendChild(lessonNameCell);

        // Lesson Description
        const lessonDescCell = document.createElement("td");
        lessonDescCell.textContent = test.description || "N/A";
        row.appendChild(lessonDescCell);

        // Date
        const dateCell = document.createElement("td");
        if (test.lastWorkedOn == "Jan 01, 0001") {
            dateCell.textContent = "N/A";
        } else {
            dateCell.textContent =  test.lastWorkedOn;
        }
        row.appendChild(dateCell);

        // Score
        const scoreCell = document.createElement("td");
        const answeredQuestions = test.correctAnswers + test.incorrectAnswers;
        if (answeredQuestions === 0) {
            scoreCell.textContent = "N/A";
        } else{
            scoreCell.textContent = test.correctAnswers + "/" + answeredQuestions;
        }

        row.appendChild(scoreCell);

        // Level
        const levelCell = document.createElement("td");
        levelCell.textContent = test.level || "N/A";
        row.appendChild(levelCell);

        // Status
        const statusCell = document.createElement("td");
        const statusSpan = document.createElement("span");
        const status = test.status ? test.status.toLowerCase() : "Error";
        statusSpan.className = "status " + status;
        statusSpan.textContent = formatStatusText(status);
        statusCell.appendChild(statusSpan);
        row.appendChild(statusCell);

        tbody.appendChild(row);
    });

    initializeTestsInteraction(); 
    animateRows('tests'); 
}

function populateLessonsTable(lessons) {
    lessons.sort((a, b) => {
        const aParts = a.ID.match(/(\d+)([A-Z])/);
        const bParts = b.ID.match(/(\d+)([A-Z])/);

        const numberComparison = parseInt(aParts[1]) - parseInt(bParts[1]);
        if (numberComparison !== 0) {
            return numberComparison;
        }
        return aParts[2].localeCompare(bParts[2]);
    });

    const tbody = document.querySelector("#lessons tbody");
    tbody.innerHTML = '';  

    lessons.forEach(lesson => {
        const row = document.createElement("tr");

        // Lesson ID
        const lessonIdCell = document.createElement("td");
        lessonIdCell.textContent = lesson.ID;
        row.appendChild(lessonIdCell);

        // Lesson Name
        const lessonNameCell = document.createElement("td");
        lessonNameCell.textContent = lesson.name;
        row.appendChild(lessonNameCell);

        // Lesson Description
        const lessonDescCell = document.createElement("td");
        lessonDescCell.textContent = lesson.description || "N/A";
        row.appendChild(lessonDescCell);

        // Date
        const dateCell = document.createElement("td");
        if (lesson.lastWorkedOn === "Jan 01, 0001") {
            dateCell.textContent = "N/A";
        } else {
            dateCell.textContent = lesson.lastWorkedOn;
        }

        row.appendChild(dateCell);
        tbody.appendChild(row);
    });

    initializeLessonsInteraction(); 
    animateRows('lessons');
}

function initializeTestsDropdown() {
    const dropdownToggle = document.querySelector('#tests .custom-dropdown-toggle');
    const dropdownMenu = document.querySelector('#tests .custom-dropdown-menu');

    dropdownToggle.addEventListener('click', function(event) {
        event.preventDefault();
        dropdownMenu.classList.toggle('active');
    });

    document.addEventListener('click', function(event) {
        if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('active');
        }
    });
}

function initializeLessonFilter() {
    document.querySelectorAll(".custom-dropdown-menu a").forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const criteria = this.textContent.trim();
            filterAndSortTableLessons(criteria);
        });
    });
}

function initializeLessonsDropdown() {
    const dropdownToggle = document.querySelector('#lessons .custom-dropdown-toggle');
    const dropdownMenu = document.querySelector('#lessons .custom-dropdown-menu');

    dropdownToggle.addEventListener('click', function(event) {
        event.preventDefault();
        dropdownMenu.classList.toggle('active');
    });

    document.addEventListener('click', function(event) {
        if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('active');
        }
    });
}

function formatStatusText(status) {
    switch (status) {
        case "not-started":
            return "Not-Started";
        case "completed":
            return "Completed";
        case "in-progress":
            return "In-Progress";
        default:
            return "Not-Started";
    }
}

function redirectToLogin() {
    localStorage.removeItem('jwt');
    window.location.href = "/login"; 
}


async function fetchLessons() {
    const sections = document.querySelectorAll('#lessons');
    if (sections.length > 1) {
        const lessonsSection = sections[1];
        const lessonsContainer = lessonsSection.querySelector('.lessons-container');

        try {
            const response = await fetch('https://driveready.org/api/lessons', {
                headers: {
                    'Authorization': localStorage.getItem('jwt')
                }
            });

            if (response.ok) {
                lessons = await response.json();
                populateLessonsTable(lessons);
                hideLoader('lessons');
                if (lessonsContainer) {
                    lessonsContainer.style.display = 'block';
                } else {
                    console.error('Lessons container element not found');
                }
            } else {
                const errorData = await response.json();
                showWarning("Error: " + (errorData.error || "An error occurred while fetching lessons."));
            }
        } catch (error) {
            console.error("Error:", error);
            showWarning("Error: " + error.message);
        }
    } else {
        console.error('Lessons section element not found');
    }
}

async function fetchDashboard() {
    const totalUsersContainer = document.querySelector("#total-users-count");
    const completesLessonssContainer = document.querySelector("#completed-lessons-count");
    const activeTestsContainer = document.querySelector("#active-tests-count");
    const cokmpletedTestsContainer = document.querySelector("#completed-tests-count");

    try {
        // Make all API requests in parallel
        const [dashboardResponse, lessonsResponse, testsResponse] = await Promise.all([
            fetch('https://driveready.org/api/dashboard', {
                headers: { 'Authorization': localStorage.getItem('jwt') }
            }),
            fetch('https://driveready.org/api/lessons', {
                headers: { 'Authorization': localStorage.getItem('jwt') }
            }),
            fetch('https://driveready.org/api/tests', {
                headers: { 'Authorization': localStorage.getItem('jwt') }
            })
        ]);

        if (dashboardResponse.ok && lessonsResponse.ok && testsResponse.ok) {
            const dash = await dashboardResponse.json();
            const lessons = await lessonsResponse.json();
            const tests = await testsResponse.json();

            // Update dashboard metrics
            totalUsersContainer.innerText = dash.totalUsers.toLocaleString();
            completesLessonssContainer.innerText = dash.completedLessons.toLocaleString();
            activeTestsContainer.innerText = dash.activeTests.toLocaleString();
            cokmpletedTestsContainer.innerText = dash.completedTests.toLocaleString();
            
            // Load all enhanced dashboard data with the fetched data
            loadUserProgress(lessons, tests);
            loadRecentActivity(lessons, tests);
            loadNotifications(lessons, tests);
            
            // Initialize chart after data is loaded
            setTimeout(() => {
                if (!myChart) {
                    initializeChart();
                }
                updateChartWithUserData(tests);
            }, 100);
            
            hideLoader('dashboard');
        } 
    } catch (error) {
        console.error("Error:", error);
    }
}

// Enhanced Dashboard Functions
function loadUserProgress(lessons, tests) {
    try {

            // Calculate progress
            const completedLessons = lessons.filter(lesson => 
                lesson.lastWorkedOn !== "Jan 01, 0001" && lesson.lastWorkedOn !== "N/A"
            ).length;
            
            const completedTests = tests.filter(test => 
                test.status === 'completed'
            ).length;

            const totalLessons = 63; // Total lessons available
            const totalTests = 15; // Based on the test structure

            // Update progress bars
            const lessonsProgress = (completedLessons / totalLessons) * 100;
            const testsProgress = (completedTests / totalTests) * 100;

            document.getElementById('lessons-progress').style.width = `${lessonsProgress}%`;
            document.getElementById('tests-progress').style.width = `${testsProgress}%`;
            document.getElementById('lessons-progress-text').textContent = `${completedLessons}/${totalLessons} lessons`;
            document.getElementById('tests-progress-text').textContent = `${completedTests}/${totalTests} tests`;

            // Calculate average score
            const scoredTests = tests.filter(test => 
                test.correctAnswers > 0 || test.incorrectAnswers > 0
            );
            
            if (scoredTests.length > 0) {
                const totalCorrect = scoredTests.reduce((sum, test) => sum + test.correctAnswers, 0);
                const totalAnsweredQuestions = scoredTests.reduce((sum, test) => 
                    sum + test.correctAnswers + test.incorrectAnswers, 0
                );
                // Note: This calculates average based on answered questions only, not total test questions
                const averageScore = Math.round((totalCorrect / totalAnsweredQuestions) * 100);
                document.getElementById('average-score').textContent = `${averageScore}%`;
            } else {
                document.getElementById('average-score').textContent = '0%';
            }
    } catch (error) {
        console.error('Error loading user progress:', error);
    }
}

function loadRecentActivity(lessons, tests) {
    try {
        // Create activity items
        const activities = [];

        // Add recent lessons
        lessons
            .filter(lesson => lesson.lastWorkedOn !== "Jan 01, 0001" && lesson.lastWorkedOn !== "N/A")
            .sort((a, b) => new Date(b.lastWorkedOn) - new Date(a.lastWorkedOn))
            .slice(0, 3)
            .forEach(lesson => {
                activities.push({
                    type: 'lesson',
                    title: `Completed Lesson ${lesson.ID}`,
                    date: lesson.lastWorkedOn,
                    icon: 'fa-book'
                });
            });

        // Add recent tests
        tests
            .filter(test => test.status === 'completed')
            .sort((a, b) => new Date(b.lastWorkedOn) - new Date(a.lastWorkedOn))
            .slice(0, 3)
            .forEach(test => {
                const score = test.correctAnswers + test.incorrectAnswers > 0 
                    ? Math.round((test.correctAnswers / (test.correctAnswers + test.incorrectAnswers)) * 100)
                    : 0;
                activities.push({
                    type: 'test',
                    title: `Completed Test ${test.ID} (${score}%)`,
                    date: test.lastWorkedOn,
                    icon: 'fa-clipboard-check'
                });
            });

        // Sort by date and take top 5
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentActivities = activities.slice(0, 5);

        // Update UI
        const activityList = document.getElementById('recent-activity');
        if (recentActivities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fa-solid fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <p>No recent activity. Start learning to see your progress here!</p>
                    </div>
                </div>
            `;
        } else {
            activityList.innerHTML = recentActivities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fa-solid ${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <p>${activity.title}</p>
                        <small style="color: #666;">${activity.date}</small>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}


function loadNotifications(lessons, tests) {
    try {
        const notifications = [];
        
        // Generate notifications based on recent activity
        const recentLessons = lessons
            .filter(lesson => lesson.lastWorkedOn !== "Jan 01, 0001" && lesson.lastWorkedOn !== "N/A")
            .sort((a, b) => new Date(b.lastWorkedOn) - new Date(a.lastWorkedOn))
            .slice(0, 3);

        const recentTests = tests
            .filter(test => test.status === 'completed')
            .sort((a, b) => new Date(b.lastWorkedOn) - new Date(a.lastWorkedOn))
            .slice(0, 2);

        // Add lesson completion notifications
        recentLessons.forEach(lesson => {
            notifications.push({
                type: 'lesson',
                title: `Lesson ${lesson.ID} completed!`,
                message: `Great job completing "${lesson.name}"`,
                time: lesson.lastWorkedOn,
                icon: 'fa-book',
                color: '#4CAF50'
            });
        });

        // Add test completion notifications
        recentTests.forEach(test => {
            const score = test.correctAnswers + test.incorrectAnswers > 0 
                ? Math.round((test.correctAnswers / (test.correctAnswers + test.incorrectAnswers)) * 100)
                : 0;
            notifications.push({
                type: 'test',
                title: `Test ${test.ID} completed!`,
                message: `You scored ${score}% on "${test.name}"`,
                time: test.lastWorkedOn,
                icon: 'fa-clipboard-check',
                color: score >= 80 ? '#4CAF50' : score >= 60 ? '#FF9800' : '#F44336'
            });
        });

        // Sort notifications by date (most recent first)
        notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

        // Update notification count
        const notificationCount = document.getElementById('notification-count');
        notificationCount.textContent = notifications.length;

        // Update notification list
        const notificationList = document.getElementById('notification-list');
        
        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="notification-item">
                    <div class="notification-icon">
                        <i class="fa-solid fa-info-circle"></i>
                    </div>
                    <div class="notification-content">
                        <p>No new notifications</p>
                        <small>You're all caught up!</small>
                    </div>
                </div>
            `;
        } else {
            notificationList.innerHTML = notifications.map(notification => `
                <div class="notification-item">
                    <div class="notification-icon" style="background: ${notification.color}20; color: ${notification.color};">
                        <i class="fa-solid ${notification.icon}"></i>
                    </div>
                    <div class="notification-content">
                        <p>${notification.title}</p>
                        <small>${notification.message} • ${notification.time}</small>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function refreshDashboard() {
    showLoader('dashboard');
    fetchDashboard();
}

// View Toggle Functions
async function toggleView(section, viewType) {
    const tableContainer = document.querySelector(`#${section} .table-container`);
    const gridContainer = document.querySelector(`#${section}-grid`);
    const listBtn = document.querySelector(`#list-view-${section}`);
    const gridBtn = document.querySelector(`#grid-view-${section}`);
    
    if (viewType === 'list') {
        tableContainer.style.display = 'block';
        gridContainer.style.display = 'none';
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
    } else {
        tableContainer.style.display = 'none';
        gridContainer.style.display = 'block';
        listBtn.classList.remove('active');
        gridBtn.classList.add('active');
        
        // Populate grid if not already populated
        if (section === 'lessons' && lessons.length > 0) {
            populateLessonsGrid();
        } else if (section === 'tests') {
            await populateTestsGrid();
        }
    }
}

function populateLessonsGrid() {
    const gridContent = document.getElementById('lessons-grid-content');
    gridContent.innerHTML = '';
    
    lessons.forEach(lesson => {
        const card = document.createElement('div');
        const isCompleted = lesson.lastWorkedOn !== "Jan 01, 0001" && lesson.lastWorkedOn !== "N/A";
        const isNotStarted = lesson.lastWorkedOn === "Jan 01, 0001" || lesson.lastWorkedOn === "N/A";
        
        card.className = `lesson-card ${isCompleted ? 'completed' : ''}`;
        card.onclick = () => fetchLesson(lesson.ID);
        
        const date = isNotStarted ? "Not started" : lesson.lastWorkedOn;
        
        card.innerHTML = `
            <h4>Lesson ${lesson.ID}</h4>
            <p><strong>${lesson.name}</strong></p>
            <p>${lesson.description || 'No description available'}</p>
            <div class="lesson-meta">
                <span class="lesson-date">${date}</span>
            </div>
        `;
        
        gridContent.appendChild(card);
    });
}

async function populateTestsGrid() {
    const gridContent = document.getElementById('tests-grid-content');
    gridContent.innerHTML = '';
    
    // Always fetch fresh tests data to ensure consistency with table view
    try {
        const response = await fetch('https://driveready.org/api/tests', {
            headers: { 'Authorization': localStorage.getItem('jwt') }
        });
        if (response.ok) {
            const testsData = await response.json();
            
            // Sort tests numerically by ID to match list view sorting
            testsData.sort((a, b) => a.ID - b.ID);
    
            testsData.forEach(test => {
                const card = document.createElement('div');
                const isCompleted = test.status === 'completed';
                card.className = `test-card ${isCompleted ? 'completed' : ''}`;
                card.onclick = () => fetchTestQuestions(test.ID);
                
                const date = test.lastWorkedOn === "Jan 01, 0001" ? "Not started" : test.lastWorkedOn;
                const answeredQuestions = test.correctAnswers + test.incorrectAnswers;
                // Note: This calculation is based on answered questions only, not total test questions
                // The API doesn't provide total question count, so we show score based on answered questions
                const score = answeredQuestions > 0 ? Math.round((test.correctAnswers / answeredQuestions) * 100) : 0;
                
                let scoreClass = 'low';
                if (score >= 80) scoreClass = 'high';
                else if (score >= 60) scoreClass = 'medium';
                
                const statusClass = test.status ? test.status.toLowerCase().replace('-', '-') : 'not-started';
                
                card.innerHTML = `
                    <h4>Test ${test.ID}</h4>
                    <p><strong>${test.name}</strong></p>
                    <p>${test.description || 'No description available'}</p>
                    <div class="test-meta">
                        <span class="test-date">${date}</span>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            ${answeredQuestions > 0 ? `<span class="test-score ${scoreClass}">${score}%</span>` : ''}
                            <span class="test-status ${statusClass}">${formatStatusText(test.status || 'not-started')}</span>
                        </div>
                    </div>
                `;
                
                gridContent.appendChild(card);
            });
        } else {
            console.error('Failed to fetch tests data');
        }
    } catch (error) {
        console.error('Error fetching tests data:', error);
    }
}

async function fetchTests() {
    const sections = document.querySelectorAll('#tests');
    if (sections.length > 1) {
        const testsSection = sections[1];
        const testsContainer = testsSection.querySelector('.tests-container');

        try {
            const response = await fetch('https://driveready.org/api/tests', {
                headers: {
                    'Authorization': localStorage.getItem('jwt')
                }
            });

            if (response.ok) {
                const tests = await response.json();
                populateTestsTable(tests);
                hideLoader('tests');
                if (testsContainer) {
                    testsContainer.style.display = 'block';
                } 
            } else {
                const errorData = await response.json();
                showWarning("Error: " + (errorData.error || "An error occurred while fetching lessons."));
            }
        } catch (error) {
            console.error("Error:", error);
            showWarning("Error: " + error.message);
        }
    } else {
        console.error('Lessons section element not found');
    }
}

let myChart = null;

function initializeChart() {
    const chartElement = document.getElementById('myChart');
    if (!chartElement) {
        console.error('Chart element not found');
        return;
    }

    const ctx = chartElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgba(72, 145, 255, 0.5)'); 
gradient.addColorStop(1, 'rgba(72, 145, 255, 0)'); 

    // Destroy existing chart if it exists
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
    type: 'line',
    data: {
            labels: ['No data available'],
        datasets: [{
                label: 'Test Scores',
                data: [0],
            backgroundColor: gradient,
            borderColor: 'rgba(99, 132, 255, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(99, 132, 255, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(99, 132, 255, 1)',
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: function(value) { return value + "%" },
                },
                grid: {
                    drawBorder: false,
                }
            },
            x: {
                grid: {
                    drawBorder: false,
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.raw + "%";
                    }
                }
            },
            legend: {
                display: false
            }
        }
    }
});
}

function updateChartWithUserData(tests) {
    try {
        // Filter completed tests and calculate scores
        const completedTests = tests
            .filter(test => test.status === 'completed' && (test.correctAnswers > 0 || test.incorrectAnswers > 0))
            .map(test => {
                const total = test.correctAnswers + test.incorrectAnswers;
                const score = total > 0 ? Math.round((test.correctAnswers / total) * 100) : 0;
                return {
                    id: test.ID,
                    score: score,
                    date: test.lastWorkedOn
                };
            })
            .sort((a, b) => a.id - b.id); // Sort by test ID

        if (completedTests.length > 0) {
            const labels = completedTests.map(test => `Test ${test.id}`);
            const scores = completedTests.map(test => test.score);

            if (myChart) {
                myChart.data.labels = labels;
                myChart.data.datasets[0].data = scores;
                myChart.update();
            }
        } else {
            // Show placeholder data if no tests completed
            if (myChart) {
                myChart.data.labels = ['No tests completed yet'];
                myChart.data.datasets[0].data = [0];
                myChart.update();
            }
        }
    } catch (error) {
        console.error('Error updating chart:', error);
        if (myChart) {
            myChart.data.labels = ['Error loading data'];
            myChart.data.datasets[0].data = [0];
            myChart.update();
        }
    }
}
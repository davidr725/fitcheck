// ============================================================
// FitCheck v2 — Gym Notebook
// ============================================================

(function () {
    'use strict';

    // --- Storage Keys ---
    const KEYS = {
        program: 'fitcheck_program',
        checks: 'fitcheck_checks',
        logs: 'fitcheck_logs',
        goals: 'fitcheck_goals',
    };

    // --- Default Program ---
    const DEFAULT_PROGRAM = {
        name: "Default Program",
        days: [
            {
                day: "Mon", title: "Upper Strength", rest: "3-5 min", intensity: "3-5 reps",
                exercises: [
                    { name: "Barbell Bench Press", sets: 4, reps: "3-5", goalLift: "bench" },
                    { name: "Lat Pulldown", sets: 4, reps: "3-5" },
                    { name: "Chest Press Machine", sets: 4, reps: "3-5" },
                    { name: "Cable Row", sets: 4, reps: "3-5" },
                    { name: "Dumbbell Shoulder Press", sets: 4, reps: "3-5" },
                    { name: "Leg Raises", sets: 3, reps: "12-15" },
                    { name: "Planks", sets: 3, reps: "30-60s" },
                    { name: "Cardio", sets: 1, reps: "20 min" }
                ]
            },
            {
                day: "Tue", title: "Lower Strength", rest: "3-5 min", intensity: "3-5 reps",
                exercises: [
                    { name: "Barbell Back Squat", sets: 4, reps: "3-5", goalLift: "squat" },
                    { name: "Barbell Deadlift", sets: 4, reps: "3-5", goalLift: "deadlift" },
                    { name: "Leg Press", sets: 4, reps: "3-5" },
                    { name: "Sit Ups", sets: 4, reps: "15-20" },
                    { name: "Leg Raises", sets: 4, reps: "12-15" },
                    { name: "Cardio", sets: 1, reps: "20 min" }
                ]
            },
            {
                day: "Wed", title: "Arms + Functional", rest: "90-180s", intensity: "10-12 reps",
                exercises: [
                    { name: "Overhead Press", sets: 3, reps: "10-12", goalLift: "ohp" },
                    { name: "Bicep Curls", sets: 3, reps: "10-12" },
                    { name: "Overhead Tricep Extensions", sets: 3, reps: "10-12" },
                    { name: "Kettlebell Swings", sets: 3, reps: "12-15" },
                    { name: "Landmine Press", sets: 3, reps: "10-12" },
                    { name: "Landmine Rotations", sets: 3, reps: "10-12" },
                    { name: "Leg Raises", sets: 3, reps: "12-15" },
                    { name: "Planks", sets: 3, reps: "30-60s" },
                    { name: "Cardio", sets: 1, reps: "20 min" }
                ]
            },
            {
                day: "Thu", title: "Full Body Strength", rest: "3-5 min", intensity: "3-5 reps",
                exercises: [
                    { name: "Barbell Back Squat", sets: 4, reps: "3-5", goalLift: "squat" },
                    { name: "Barbell Bench Press", sets: 4, reps: "3-5", goalLift: "bench" },
                    { name: "Lat Pulldown", sets: 4, reps: "3-5" },
                    { name: "Barbell Deadlift", sets: 4, reps: "3-5", goalLift: "deadlift" },
                    { name: "Cable Row", sets: 4, reps: "3-5" },
                    { name: "Leg Raises", sets: 3, reps: "12-15" },
                    { name: "Planks", sets: 3, reps: "30-60s" },
                    { name: "Cardio", sets: 1, reps: "20 min" }
                ]
            },
            {
                day: "Fri", title: "Full Body Endurance", rest: "90-180s", intensity: "12-15 reps",
                exercises: [
                    { name: "Bench Press", sets: 3, reps: "12-15", goalLift: "bench" },
                    { name: "Squats", sets: 3, reps: "12-15", goalLift: "squat" },
                    { name: "Deadlifts", sets: 3, reps: "12-15", goalLift: "deadlift" },
                    { name: "Dumbbell Rows", sets: 3, reps: "12-15" },
                    { name: "Dumbbell Shoulder Press", sets: 3, reps: "12-15" },
                    { name: "Leg Raises", sets: 3, reps: "12-15" },
                    { name: "Planks", sets: 3, reps: "30-60s" },
                    { name: "Cardio", sets: 1, reps: "20 min" }
                ]
            }
        ]
    };

    // --- Default Goals ---
    const DEFAULT_GOALS = [
        { id: "bench", name: "Bench Press", target: 225, unit: "lbs", recent: null, best: null },
        { id: "squat", name: "Squat", target: 225, unit: "lbs", recent: null, best: null },
        { id: "deadlift", name: "Deadlift", target: 225, unit: "lbs", recent: null, best: null },
        { id: "ohp", name: "Overhead Press", target: 135, unit: "lbs", recent: null, best: null },
        { id: "5k", name: "Running", target: 3.1, unit: "miles", recent: null, best: null },
        { id: "vo2max", name: "VO2max", target: 52, unit: "", recent: null, best: null },
    ];

    // --- State ---
    let program = loadJSON(KEYS.program) || JSON.parse(JSON.stringify(DEFAULT_PROGRAM));
    let checks = loadJSON(KEYS.checks) || {};
    let logs = loadJSON(KEYS.logs) || {};
    let goals = loadJSON(KEYS.goals) || JSON.parse(JSON.stringify(DEFAULT_GOALS));
    let currentTab = 'today';
    let selectedDayIndex = getTodayDayIndex();

    // Stopwatch state
    let swRunning = false;
    let swStartTime = 0;
    let swElapsed = 0;
    let swInterval = null;

    // --- Helpers ---
    function loadJSON(key) {
        try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
    }
    function saveJSON(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    function getTodayDayIndex() {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = dayNames[new Date().getDay()];
        const idx = program.days.findIndex(d => d.day === today);
        return idx >= 0 ? idx : 0;
    }
    function getDateKey() {
        return new Date().toISOString().slice(0, 10);
    }
    function $(sel, parent) { return (parent || document).querySelector(sel); }

    // --- DOM refs ---
    const content = $('#content');
    const headerTitle = $('#header-title');
    const tabBar = $('#tab-bar');

    // --- Tab Navigation ---
    tabBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab');
        if (!btn) return;
        const tab = btn.dataset.tab;
        if (tab === currentTab) return;
        currentTab = tab;
        tabBar.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        render();
    });

    // --- Render Router ---
    function render() {
        content.innerHTML = '';
        if (currentTab === 'today') renderToday();
        else if (currentTab === 'goals') renderGoals();
        else if (currentTab === 'edit') renderEdit();
    }

    // ============================================================
    // TODAY TAB
    // ============================================================
    function renderToday() {
        content.innerHTML = '';
        headerTitle.textContent = 'Today';

        if (program.days.length === 0) {
            content.innerHTML = '<div class="empty-state">No workouts configured.<br>Go to Edit to set up your program.</div>';
            return;
        }

        // Day pills
        const pills = document.createElement('div');
        pills.className = 'day-pills';
        program.days.forEach((day, i) => {
            const btn = document.createElement('button');
            btn.className = 'day-pill' + (i === selectedDayIndex ? ' active' : '');
            btn.textContent = day.day;
            btn.addEventListener('click', () => { selectedDayIndex = i; renderToday(); });
            pills.appendChild(btn);
        });
        content.appendChild(pills);

        const day = program.days[selectedDayIndex];
        if (!day) return;

        // Stopwatch
        content.appendChild(buildStopwatch());

        // Workout info
        const info = document.createElement('div');
        info.className = 'workout-info';
        info.innerHTML = `<span>${day.title}</span><span>${day.rest}</span><span>${day.intensity}</span>`;
        content.appendChild(info);

        // Exercise cards
        const dateKey = getDateKey();
        day.exercises.forEach((ex, exIdx) => {
            const card = document.createElement('div');
            card.className = 'exercise-card';

            const header = document.createElement('div');
            header.className = 'exercise-header';
            header.innerHTML = `<h2>${ex.name}</h2><span class="set-count">${ex.sets} ${ex.sets === 1 ? 'set' : 'sets'} &middot; ${ex.reps || ''}</span>`;
            card.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'sets-grid';

            for (let s = 1; s <= ex.sets; s++) {
                const checkId = `${selectedDayIndex}-${exIdx}-${s}-${dateKey}`;
                const logId = `${selectedDayIndex}-${exIdx}-${s}-${dateKey}`;
                const isChecked = !!checks[checkId];
                const logData = logs[logId] || {};

                const row = document.createElement('div');
                row.className = 'set-row' + (isChecked ? ' checked' : '');

                // Check button
                const checkBtn = document.createElement('button');
                checkBtn.className = 'set-check' + (isChecked ? ' done' : '');
                checkBtn.addEventListener('click', () => {
                    checks[checkId] = !checks[checkId];
                    saveJSON(KEYS.checks, checks);
                    // If checking and there's weight logged, update goal
                    if (checks[checkId] && ex.goalLift && logData.weight) {
                        updateGoalFromLog(ex.goalLift, parseFloat(logData.weight));
                    }
                    renderToday();
                });

                // Label
                const label = document.createElement('span');
                label.className = 'set-label-text';
                label.textContent = ex.sets === 1 ? 'Done' : `Set ${s}`;

                // Weight + Reps inputs
                const inputs = document.createElement('div');
                inputs.className = 'set-inputs';

                const weightInput = document.createElement('input');
                weightInput.type = 'number';
                weightInput.className = 'set-input';
                weightInput.placeholder = 'lbs';
                weightInput.inputMode = 'decimal';
                weightInput.value = logData.weight || '';
                weightInput.addEventListener('change', (e) => {
                    if (!logs[logId]) logs[logId] = {};
                    logs[logId].weight = e.target.value;
                    saveJSON(KEYS.logs, logs);
                    if (ex.goalLift && e.target.value) {
                        updateGoalFromLog(ex.goalLift, parseFloat(e.target.value));
                    }
                });

                const repsInput = document.createElement('input');
                repsInput.type = 'number';
                repsInput.className = 'set-input';
                repsInput.placeholder = 'reps';
                repsInput.inputMode = 'numeric';
                repsInput.value = logData.reps || '';
                repsInput.addEventListener('change', (e) => {
                    if (!logs[logId]) logs[logId] = {};
                    logs[logId].reps = e.target.value;
                    saveJSON(KEYS.logs, logs);
                });

                inputs.appendChild(weightInput);
                inputs.appendChild(repsInput);

                row.appendChild(checkBtn);
                row.appendChild(label);
                row.appendChild(inputs);
                grid.appendChild(row);
            }

            card.appendChild(grid);
            content.appendChild(card);
        });

        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'reset-btn';
        resetBtn.textContent = `Reset ${day.day}'s Checks`;
        resetBtn.addEventListener('click', () => {
            if (!confirm(`Reset all checks for ${day.day}?`)) return;
            const dateKey = getDateKey();
            const prefix = `${selectedDayIndex}-`;
            Object.keys(checks).forEach(k => {
                if (k.startsWith(prefix) && k.endsWith(dateKey)) delete checks[k];
            });
            saveJSON(KEYS.checks, checks);
            renderToday();
        });
        content.appendChild(resetBtn);
    }

    // --- Stopwatch ---
    function buildStopwatch() {
        const sw = document.createElement('div');
        sw.className = 'stopwatch';

        const display = document.createElement('div');
        display.className = 'stopwatch-display';
        display.id = 'sw-display';
        display.textContent = formatTime(swElapsed);

        const controls = document.createElement('div');
        controls.className = 'stopwatch-controls';

        const startBtn = document.createElement('button');
        startBtn.className = 'sw-btn sw-btn-start' + (swRunning ? ' running' : '');
        startBtn.textContent = swRunning ? '■' : '▶';
        startBtn.addEventListener('click', () => {
            if (swRunning) {
                clearInterval(swInterval);
                swElapsed += Date.now() - swStartTime;
                swRunning = false;
            } else {
                swStartTime = Date.now();
                swRunning = true;
                swInterval = setInterval(updateStopwatchDisplay, 100);
            }
            renderToday();
        });

        const resetBtn = document.createElement('button');
        resetBtn.className = 'sw-btn sw-btn-reset';
        resetBtn.textContent = '↺';
        resetBtn.addEventListener('click', () => {
            clearInterval(swInterval);
            swRunning = false;
            swElapsed = 0;
            swStartTime = 0;
            renderToday();
        });

        controls.appendChild(startBtn);
        controls.appendChild(resetBtn);
        sw.appendChild(display);
        sw.appendChild(controls);

        // If running, keep updating
        if (swRunning) {
            clearInterval(swInterval);
            swInterval = setInterval(updateStopwatchDisplay, 100);
        }

        return sw;
    }

    function updateStopwatchDisplay() {
        const el = document.getElementById('sw-display');
        if (!el) return;
        const total = swElapsed + (swRunning ? Date.now() - swStartTime : 0);
        el.textContent = formatTime(total);
    }

    function formatTime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        const tenths = Math.floor((ms % 1000) / 100);
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${tenths}`;
    }

    // --- Goal Update from Workout Log ---
    function updateGoalFromLog(goalId, weight) {
        const goal = goals.find(g => g.id === goalId);
        if (!goal || isNaN(weight)) return;
        goal.recent = weight;
        if (goal.best === null || weight > goal.best) goal.best = weight;
        saveJSON(KEYS.goals, goals);
    }

    // ============================================================
    // GOALS TAB
    // ============================================================
    function renderGoals() {
        content.innerHTML = '';
        headerTitle.textContent = 'Goals';

        goals.forEach((goal) => {
            const card = document.createElement('div');
            card.className = 'goal-card';

            const header = document.createElement('div');
            header.className = 'goal-header';
            header.innerHTML = `
                <span class="goal-name">${goal.name}</span>
                <span class="goal-target">${goal.target ? 'Target: ' + goal.target + ' ' + goal.unit : (goal.binary ? 'Yes / No' : '')}</span>
            `;
            card.appendChild(header);

            if (goal.binary) {
                // Binary goals (5K, swim, VO2max)
                const values = document.createElement('div');
                values.className = 'goal-values';
                const recentVal = goal.recent ? 'Yes' : 'Not yet';
                values.innerHTML = `
                    <div class="goal-stat">
                        <span class="goal-stat-label">Status</span>
                        <span class="goal-stat-value" style="color: ${goal.recent ? 'var(--green)' : 'var(--text-muted)'}">${recentVal}</span>
                    </div>
                `;
                card.appendChild(values);

                // Progress bar
                const progress = document.createElement('div');
                progress.className = 'goal-progress';
                progress.innerHTML = `<div class="goal-progress-fill" style="width: ${goal.recent ? 100 : 0}%; background: var(--green);"></div>`;
                card.appendChild(progress);
            } else {
                // Numeric goals (lifts)
                const values = document.createElement('div');
                values.className = 'goal-values';
                values.innerHTML = `
                    <div class="goal-stat">
                        <span class="goal-stat-label">Recent</span>
                        <span class="goal-stat-value">${goal.recent !== null ? goal.recent + ' ' + goal.unit : '—'}</span>
                    </div>
                    <div class="goal-stat">
                        <span class="goal-stat-label">Best</span>
                        <span class="goal-stat-value">${goal.best !== null ? goal.best + ' ' + goal.unit : '—'}</span>
                    </div>
                `;
                card.appendChild(values);

                // Progress bar
                if (goal.target) {
                    const pct = goal.best ? Math.min(100, Math.round((goal.best / goal.target) * 100)) : 0;
                    const color = pct >= 100 ? 'var(--green)' : pct >= 60 ? 'var(--orange)' : 'var(--accent)';
                    const progress = document.createElement('div');
                    progress.className = 'goal-progress';
                    progress.innerHTML = `<div class="goal-progress-fill" style="width: ${pct}%; background: ${color};"></div>`;
                    card.appendChild(progress);
                }
            }

            // Update button
            const updateBtn = document.createElement('button');
            updateBtn.className = 'goal-update-btn';
            updateBtn.textContent = 'Update';
            updateBtn.addEventListener('click', () => showGoalModal(goal));
            card.appendChild(updateBtn);

            content.appendChild(card);
        });
    }

    function showGoalModal(goal) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        if (goal.binary) {
            modal.innerHTML = `
                <h3>Update: ${goal.name}</h3>
                <p style="margin-bottom: 16px; color: var(--text-muted); font-size: 14px;">Have you achieved this goal?</p>
                <div class="modal-actions">
                    <button class="modal-cancel">Cancel</button>
                    <button class="modal-save" data-val="no" style="background: var(--card-secondary); color: var(--text);">Not Yet</button>
                    <button class="modal-save" data-val="yes">Yes!</button>
                </div>
            `;
            modal.querySelector('[data-val="yes"]').addEventListener('click', () => {
                goal.recent = true;
                saveJSON(KEYS.goals, goals);
                overlay.remove();
                renderGoals();
            });
            modal.querySelector('[data-val="no"]').addEventListener('click', () => {
                goal.recent = false;
                saveJSON(KEYS.goals, goals);
                overlay.remove();
                renderGoals();
            });
        } else {
            modal.innerHTML = `
                <h3>Update: ${goal.name}</h3>
                <input class="modal-input" type="number" inputmode="decimal" placeholder="Enter weight (${goal.unit})" value="${goal.recent || ''}">
                <div class="modal-actions">
                    <button class="modal-cancel">Cancel</button>
                    <button class="modal-save">Save</button>
                </div>
            `;
            const input = modal.querySelector('.modal-input');
            modal.querySelector('.modal-save').addEventListener('click', () => {
                const val = parseFloat(input.value);
                if (!isNaN(val)) {
                    goal.recent = val;
                    if (goal.best === null || val > goal.best) goal.best = val;
                    saveJSON(KEYS.goals, goals);
                }
                overlay.remove();
                renderGoals();
            });
            setTimeout(() => input.focus(), 100);
        }

        modal.querySelector('.modal-cancel').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    // ============================================================
    // EDIT TAB
    // ============================================================
    function renderEdit() {
        content.innerHTML = '';
        headerTitle.textContent = 'Edit Program';

        // Import / Export
        const ioRow = document.createElement('div');
        ioRow.className = 'io-buttons';

        const importBtn = document.createElement('button');
        importBtn.className = 'io-btn io-btn-import';
        importBtn.textContent = 'Import JSON';
        importBtn.addEventListener('click', importProgram);

        const exportBtn = document.createElement('button');
        exportBtn.className = 'io-btn io-btn-export';
        exportBtn.textContent = 'Export JSON';
        exportBtn.addEventListener('click', exportProgram);

        ioRow.appendChild(importBtn);
        ioRow.appendChild(exportBtn);
        content.appendChild(ioRow);

        // Program name
        const nameCard = document.createElement('div');
        nameCard.className = 'card';
        nameCard.innerHTML = `<div class="card-muted">Current Program</div><h2 style="margin-top:4px;">${program.name}</h2>`;
        content.appendChild(nameCard);

        // Days
        program.days.forEach((day, dayIdx) => {
            const section = document.createElement('div');
            section.className = 'edit-day-section';

            const header = document.createElement('div');
            header.className = 'edit-day-header';
            header.innerHTML = `<h2>${day.day} — ${day.title}</h2>`;

            const removeDayBtn = document.createElement('button');
            removeDayBtn.className = 'edit-remove-btn';
            removeDayBtn.textContent = '×';
            removeDayBtn.addEventListener('click', () => {
                if (!confirm(`Remove ${day.day} — ${day.title}?`)) return;
                program.days.splice(dayIdx, 1);
                saveJSON(KEYS.program, program);
                renderEdit();
            });
            header.appendChild(removeDayBtn);
            section.appendChild(header);

            const list = document.createElement('div');
            list.className = 'edit-exercise-list';

            day.exercises.forEach((ex, exIdx) => {
                const row = document.createElement('div');
                row.className = 'edit-exercise-row';
                row.innerHTML = `
                    <span class="edit-exercise-name">${ex.name}</span>
                    <span class="edit-exercise-sets">${ex.sets}×${ex.reps || '?'}</span>
                `;
                const removeBtn = document.createElement('button');
                removeBtn.className = 'edit-remove-btn';
                removeBtn.textContent = '×';
                removeBtn.addEventListener('click', () => {
                    day.exercises.splice(exIdx, 1);
                    saveJSON(KEYS.program, program);
                    renderEdit();
                });
                row.appendChild(removeBtn);
                list.appendChild(row);
            });

            section.appendChild(list);

            // Add exercise button
            const addBtn = document.createElement('button');
            addBtn.className = 'edit-add-btn';
            addBtn.textContent = '+ Add Exercise';
            addBtn.addEventListener('click', () => showAddExerciseModal(dayIdx));
            section.appendChild(addBtn);

            content.appendChild(section);
        });

        // Add day button
        const addDayBtn = document.createElement('button');
        addDayBtn.className = 'edit-add-btn';
        addDayBtn.style.marginTop = '16px';
        addDayBtn.textContent = '+ Add Day';
        addDayBtn.addEventListener('click', showAddDayModal);
        content.appendChild(addDayBtn);

        // Reset to defaults
        const resetBtn = document.createElement('button');
        resetBtn.className = 'reset-btn';
        resetBtn.textContent = 'Reset to Default Program';
        resetBtn.addEventListener('click', () => {
            if (!confirm('Reset program to defaults? This will erase your custom program.')) return;
            program = JSON.parse(JSON.stringify(DEFAULT_PROGRAM));
            saveJSON(KEYS.program, program);
            renderEdit();
        });
        content.appendChild(resetBtn);
    }

    function showAddExerciseModal(dayIdx) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <h3>Add Exercise</h3>
            <input class="modal-input" type="text" placeholder="Exercise name" id="add-ex-name">
            <input class="modal-input" type="number" inputmode="numeric" placeholder="Number of sets" id="add-ex-sets">
            <input class="modal-input" type="text" placeholder="Reps (e.g. 8-12)" id="add-ex-reps">
            <div class="modal-actions">
                <button class="modal-cancel">Cancel</button>
                <button class="modal-save">Add</button>
            </div>
        `;
        modal.querySelector('.modal-save').addEventListener('click', () => {
            const name = modal.querySelector('#add-ex-name').value.trim();
            const sets = parseInt(modal.querySelector('#add-ex-sets').value) || 3;
            const reps = modal.querySelector('#add-ex-reps').value.trim() || '8-12';
            if (name) {
                program.days[dayIdx].exercises.push({ name, sets, reps });
                saveJSON(KEYS.program, program);
            }
            overlay.remove();
            renderEdit();
        });
        modal.querySelector('.modal-cancel').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        setTimeout(() => modal.querySelector('#add-ex-name').focus(), 100);
    }

    function showAddDayModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <h3>Add Day</h3>
            <input class="modal-input" type="text" placeholder="Day abbreviation (e.g. Sat)" id="add-day-abbr">
            <input class="modal-input" type="text" placeholder="Workout title" id="add-day-title">
            <input class="modal-input" type="text" placeholder="Rest period (e.g. 2-3 min)" id="add-day-rest">
            <input class="modal-input" type="text" placeholder="Rep range (e.g. 8-12 reps)" id="add-day-intensity">
            <div class="modal-actions">
                <button class="modal-cancel">Cancel</button>
                <button class="modal-save">Add</button>
            </div>
        `;
        modal.querySelector('.modal-save').addEventListener('click', () => {
            const day = modal.querySelector('#add-day-abbr').value.trim() || 'New';
            const title = modal.querySelector('#add-day-title').value.trim() || 'Workout';
            const rest = modal.querySelector('#add-day-rest').value.trim() || '2-3 min';
            const intensity = modal.querySelector('#add-day-intensity').value.trim() || '8-12 reps';
            program.days.push({ day, title, rest, intensity, exercises: [] });
            saveJSON(KEYS.program, program);
            overlay.remove();
            renderEdit();
        });
        modal.querySelector('.modal-cancel').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        setTimeout(() => modal.querySelector('#add-day-abbr').focus(), 100);
    }

    // --- Import / Export ---
    function importProgram() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (!data.days || !Array.isArray(data.days)) {
                        alert('Invalid program format. JSON must have a "days" array.');
                        return;
                    }
                    program = data;
                    if (!program.name) program.name = 'Imported Program';
                    saveJSON(KEYS.program, program);
                    selectedDayIndex = 0;
                    alert('Program imported!');
                    renderEdit();
                } catch (err) {
                    alert('Error reading JSON: ' + err.message);
                }
            };
            reader.readAsText(file);
        });
        input.click();
    }

    function exportProgram() {
        const blob = new Blob([JSON.stringify(program, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fitcheck-program.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    // --- Init ---
    render();

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
})();

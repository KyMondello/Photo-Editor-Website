//UI definitions of each tool button in the toolbar. Each button has an id corresponding to its tool name, which is used to identify the tool when clicked. The buttons are styled with CSS classes for consistent appearance and layout.
//Logic for tools lives elsewhere (in src/tools/), and the toolbar simply provides a way for users to select which tool they want to use.

const TOOL_CONTROLS = {
    contrast: [
        {key: 'contrast', label: 'Contrast', min: -100, max: 100, value: 0},
    ],
    color: [
        {key: 'brightness', label: 'Brightness', min: -100, max: 100, value: 0},
        {key: 'saturation', label: 'Saturation', min: -100, max: 100, value: 0},
    ],
    blur: [
        {key: 'blur', label: 'Blur', min: 0, max: 100, value: 0}
    ],
};

const FILTER_OPTIONS = [
    
    {key: 'sepia', label: 'Sepia'},

    
    {key: 'blackWhite', label: 'Black and White'},
    
    
    {key: 'grey', label: 'Grey'},
    
    
    {key: 'nightVision', label: 'Night Vision'},
    
    
    {key:'warm', label:'Warm'},
    
    
    {key:'cool', label:'Cool'}
]

const controls = document.getElementById('tool-controls');
let activeTool = null;

function showToolControls(toolName) {
    activeTool = toolName;
    controls.innerHTML = ''; // Clear existing controls

    //Highlight active tool button
    document.querySelectorAll('.toolbar button').forEach(button => {
        button.classList.toggle('active', button.id === `tool-${toolName}`);
    });

    if(toolName === 'filters'){
        FILTER_OPTIONS.forEach(config => controls.appendChild(createFilterButton(toolName, config)));
        return;
    }

    const sliders = TOOL_CONTROLS[toolName];
    if(!sliders){
        controls.innerHTML = `<p class = "tool-placeholder">No controls available for ${toolName}</p>`;
        return;
    }

    sliders.forEach(config => { controls.appendChild(createSlider(toolName, config)); });
}

function createSlider(toolName, {key, label, min, max, step=1, value, unit=''}) {
    const wrapper = document.createElement('label');
    wrapper.className = 'slider-control';
    wrapper.innerHTML = `
        <span class = "slider-label">${label} <output>${value}${unit}</output></span>
        <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-tool="${toolName}" data-key="${key}">
    `;

    const input = wrapper.querySelector('input');
    const output = wrapper.querySelector('output');
    
    // Fires continuously while the user drags the slider, allowing for real-time updates to the image
    input.addEventListener('input', (event) => {
        output.textContent = `${input.value}${unit}`;
        emit('tool:input', toolName, key, input.value); // Emit event for real-time updates
    });

    // Fires when the user releases the slider, allowing for final adjustments or undo history
    input.addEventListener('change', () => emit('tool:change', toolName, key, input.value)); // Emit event for final value

    //Double-clicking the slider resets it to its default value
    input.addEventListener('dblclick', () => {
        input.value = value;
        input.dispatchEvent(new Event('input')); // Trigger input event to update output and image
        input.dispatchEvent(new Event('change')); // Trigger change event for undo history
    });
    return wrapper;
}


function createFilterButton(toolName, {key,label}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-button';
    button.textContent = label;
    button.dataset.tool = toolName;
    button.key = key;
    button.classList.toggle('click', () => {
        //clicking activve filter a second time turns it off
        acviteFilter = (activeFilter === key) ? null : key;
        controls.querySelectorAll('.filter-button').forEach(b =>
            b.classList.toggle('active', b.dataset.key === activeFilter));
        document.dispatchEvent(new CustomEvent('filter:apply', {
            detail: {tool: toolName, key, active: activeFilter === key}
        }));
    });
    return button;
}
function emit(eventName, tool, key, value) {
    document.dispatchEvent(new CustomEvent(eventName, { detail: { tool, key, value: Number(value) } }));
}

// Wire every toolbar button: id="tool-<toolName>" to showToolControls(<toolName>) when clicked
document.querySelectorAll('#toolbar button').forEach(button => {
    button.addEventListener('click', () => showToolControls(button.id.replace('tool-', '')));
});

// TEMP: lets you test the UI before the logic exists. Remove once tools are wired up.
document.addEventListener('tool:input', e => console.log('input', e.detail));
document.addEventListener('tool:change', e => console.log('change', e.detail));
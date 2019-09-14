// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const vid_element_filter = "document.getElementsByTagName('video')[0].style.filter";
const execScript = code => {
    chrome.tabs.executeScript(null, { code: code });
} // runs on the page

const initFilter = {
    brightness: '1',
    contrast: '1',
    'hue-rotate': '0deg',
    blur: '0px',
    invert: '0',
    grayscale: '0',
    sepia: '0'
};

chrome.browserAction.onClicked.addListener(t=>console.log(t))

filterMaker = filter => JSON.stringify(filter).replace(/["{}]/g, '').replace(/:/g, '(').replace(/,/g, ') ') + ')'

var currentfilter = JSON.parse(JSON.stringify(initFilter));

function change(e) {
    if(e.target){execScript(`			
    			if(${vid_element_filter}=='') 
    				${vid_element_filter}="${filterMaker(currentfilter)}";
    			${vid_element_filter}=${vid_element_filter}.replace(/${e.target.getAttribute('data-filter')}\\([\-0-9a-z.]+\\)/, "${e.target.getAttribute('data-filter')}(${e.target.value}${e.target.getAttribute('data-append')})");
    		`); // runs on the page
        currentfilter[e.target.getAttribute('data-filter')] = e.target.value + e.target.getAttribute('data-append');}
     else {
     	execScript(`			
    			if(${vid_element_filter}=='') 
    				${vid_element_filter}="${filterMaker(currentfilter)}";
    			${vid_element_filter}=${vid_element_filter}.replace(/${e.getAttribute('data-filter')}\\([\-0-9a-z.]+\\)/, "${e.getAttribute('data-filter')}(${e.value}${e.getAttribute('data-append')})");
    		`)
     }
}

setSliders = (filter) => Object.keys(filter).map(k => document.getElementById('slider-' + k).value = filter[k])

reset = () => {
    setSliders(initFilter);
    execScript(`
				${vid_element_filter}="${filterMaker(initFilter)}"`);

}
updateThemes = () => {
	var c= document.querySelector('#themes').children[0];
	Array.prototype.slice.call(document.getElementById('themes').children).map(x=>document.getElementById('themes').removeChild(x))
	if(c)
		Object.keys(localStorage).map(k=>{var c1= c.cloneNode(true);c1.value=k;document.querySelector('#themes').append(c1)})
}
loadTheme = () =>{
	// console.log(document.querySelector('#themes').value,localStorage[document.querySelector('#themes').value])
	setSliders(JSON.parse(localStorage[document.querySelector('#selectedTheme').value]))
	currentfilter = JSON.parse(localStorage[document.querySelector('#selectedTheme').value]);
	var filters = document.querySelectorAll('input[data-filter]');
    [...filters].map(filter => change(filter));
}
saveTheme = () =>{
	localStorage[document.getElementById('theme').value]=JSON.stringify(currentfilter);
	document.getElementById('theme').value='';
	updateThemes();
}

document.addEventListener('DOMContentLoaded', function() { // for the popup.html
    setSliders(currentfilter)
    updateThemes();
    var filters = document.querySelectorAll('input[data-filter]');
    [...filters].map(filter => filter.addEventListener('input', change));
    document.querySelector('#reset').addEventListener('click', reset);
    document.querySelector('#save').addEventListener('click', saveTheme);
    document.querySelector('#apply').addEventListener('click', loadTheme);
});
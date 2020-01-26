var timer = [];
var times = [];
var current = 0;
var startTime;
var row = 0;

var play = false;
var pauseTime = false;
var loop = false;
var display = false;
var edit = true;
var force = 0;

var interval;

var S = 1000;
var M = 60 * S;
var H = 60 * M;

var D = H * 24;

$(document).ready(function () {
	calcListeners();
	clearTimer();

	// setInterval(function(){
	// 	$('#timer-time').text(new Date().toLocaleTimeString());
	// }, 1000);

	$('.row-add').on('click', function () {
		let template = $('#rowTemplate').html();
		$('#timer-list').append(template);
		calcListeners();
	});

	$('#play').on('click', function () {
		play = !play;
		if (play) {
			$(this).addClass('true');
			runTimer();
		} else {
			$(this).removeClass('true');
			stopTimer();
		}
	});
	$('#stop').on('click', function () {
		stopTimer(true);
	});
	$('#pause').on('click', function () {
		pauseTimer();
	});
	$('#next').on('click', function () {
		force = row + force + 1;
		runTimer();
	});
	$('#loop').on('click', function () {
		loop = !loop;
		if (loop) {
			$(this).addClass('true');
		} else {
			$(this).removeClass('true');
		}
	});
	$('#displayMode').on('click', function () {
		display = !display;
		if (display) {
			$(this).text('Time');
			$(this).addClass('true');
		} else {
			$(this).text('Timer');
			$(this).removeClass('true');
		}
		checkTimer();
	});
	$('#editMode').on('click', function () {
		edit = !edit;
		if (edit) {
			$(this).text('Edit');
			$('#timer-list').removeClass('play');
			$(this).removeClass('true');
		} else {
			$(this).text('Play');
			$('#timer-list').addClass('play');
			$(this).addClass('true');
		}
	});
	$('#clear').on('click', function () {
		if (confirm('Are you sure you want to clear the timer?')) {
			clearTimer();
		}
	});

	$('#theme-switch').on('click', function () {
		let theme = $(this).hasClass('dark');
		if (theme) {
			$(this).removeClass('dark');
			$(this).prev('.theme-title').text('Light');
			document.documentElement.setAttribute('data-theme', 'light');
		} else {
			$(this).addClass('dark');
			$(this).prev('.theme-title').text('Dark');
			document.documentElement.setAttribute('data-theme', 'dark');
		}
	});
});

function calcListeners() {
	$('#timer-list input').off('change');
	$('#timer-list input').on('change', function () {
		calcTimer();
	});
	$('#timer-list input').off('keyup');
	$('#timer-list input').on('keyup', function (e) {
		let index = $(this).closest('.timer-row').index();
		let max = $('#timer-list').children().length;
		let name = $(this).prop('class');
		let type = $(this).prop('type');
		if (e.key === 'Enter' && !e.shiftKey || e.key === 'ArrowDown' && type !== 'number') {
			$('#timer-list .timer-row').eq(index + 1 < max ? index + 1 : max - 1).find('.' + name).focus().select();
		} else if (e.key === 'Enter' && e.shiftKey || e.key === 'ArrowUp' && type !== 'number') {
			$('#timer-list .timer-row').eq(index - 1 > -1 ? index - 1 : 0).find('.' + name).focus().select();
		}
	});

	$('#timer-list .row-go').off('click');
	$('#timer-list .row-go').on('click', function () {
		force = $(this).closest('.timer-row').index();
		runTimer();
	});
	$('#timer-list .row-ignore').off('click');
	$('#timer-list .row-ignore').on('click', function () {
		$(this).toggleClass('true');
		calcTimer();
	});

	$('#timer-list .row-label').off('blur');
	$('#timer-list .row-label').on('blur', function () {
		if ($(this).text() === '') {
			$(this).text('Label');
		}
	});
	$('#timer-list .row-mode').off('click');
	$('#timer-list .row-mode').on('click', function () {
		$(this).toggleClass('true');
		calcTimer();
	});
	$('#timer-list .row-remove').off('click');
	$('#timer-list .row-remove').on('click', function () {
		$(this).closest('.timer-row').remove();
		calcTimer();
	});

	createSortable($('#timer-list')[0]);
	calcTimer();
}

function calcTimer() {
	timer = [];
	$('#timer-list').children().each(function () {
		let obj = {
			h: +$(this).find('.row-hours').val(),
			m: +$(this).find('.row-minutes').val(),
			s: +$(this).find('.row-seconds').val(),
			rawDate: $(this).find('.row-date').val(),
			mode: $(this).find('.row-mode').hasClass('true'),
			ignore: $(this).find('.row-ignore').hasClass('true')
		};
		timer.push(obj);
	});
	updateTimer();
}

function runTimer() {
	stopTimer(false);
	if (pauseTime) {
		startTime = new Date(new Date() - (pauseTime - startTime));
	} else {
		startTime = new Date();
	}
	$('#play').addClass('true');
	play = true;
	updateTimer();
	checkTimer();
	interval = setInterval(checkTimer, 1000);
}

function updateTimer() {
	let slice = timer.slice(force);
	pauseTime = false;
	for (let i in slice) {
		let lastTime = +i ? slice[i - 1].time : startTime;
		let obj = slice[i];
		if (obj.mode) { // true: time, false: duration
			obj.time = new Date(lastTime);
			obj.time.setHours(obj.h, obj.m, obj.s, 0);
			if (obj.rawDate) {
				obj.date = obj.rawDate.replace(/-0(?=[0-9]-)/, '-');
				obj.date = new Date(obj.date);
			}
			if (obj.rawDate && new Date(obj.date).setHours(obj.h, obj.m, obj.s, 0) > obj.time) {
				obj.time.setFullYear(obj.date.getFullYear(), obj.date.getMonth(), obj.date.getDate());
			}
			if (!obj.rawDate && obj.time < startTime) {
				obj.time.setTime(obj.time.getTime() + D);
			}
		} else {
			obj.time = new Date(lastTime);
			obj.time.setTime(obj.time.getTime() + hms(obj.h, obj.m, obj.s));
		}
		if (slice[i].ignore) {
			obj.time = new Date(lastTime);
		}
	}
	times = slice.map(el => el.time);

	if (play) {
		checkTimer();
	}
}

function checkTimer() {
	let now = new Date();
	let change = false;
	row = undefined;
	for (let i in times) { // get current row
		if (now < times[i]) {
			change = row !== i;
			row = +i;
			break;
		}
	}
	if (typeof row === 'number') { // true: normal, false: overtime
		$('#timer-time').text(new Date().toLocaleTimeString());
		if (display) {
			$('#timer-main').text(new Date(times[row]).toLocaleTimeString() + ' - ' + format(times[row] - now));
			$('#timer-sub').text(new Date(times[times.length - 1]).toLocaleTimeString() + ' - ' + format(times[times.length - 1] - now));
		} else {
			$('#timer-main').text(format(times[row] - now));
			$('#timer-sub').text(format(times[times.length - 1] - now));
		}
		$('.done').removeClass('done');
		if (change) {
			$('.highlight').removeClass('highlight');
			$('.done').removeClass('done');
		}
		for (let i = 0; i < row + force; i++) {
			$('.timer-row').eq(i).addClass('done');
		}
		$('.timer-row.done').find('.row-timer').text('00');
		$('#timer-list .row-ignore.true').closest('.timer-row').addClass('done');
		$('.timer-row').slice(row + force).each(function (i) {
			if (display) {
				$(this).not('.done').find('.row-timer').text(timer[i + row].time.toLocaleTimeString());
			} else {
				$(this).not('.done').find('.row-timer').text(format(times[i + row] - now));
			}
		});
		$('.timer-row').eq(row + force).removeClass('done');
		$('.timer-row').eq(row + force).addClass('highlight');
		$('title').text(format(times[row] - now) + ' - ' + ($('.timer-row').eq(row + force).find('.row-label').val() || 'Label'));
	} else {
		stopTimer(!loop);
		if (loop) {
			runTimer();
		}
	}
}

function stopTimer(full = true) {
	clearInterval(interval);
	$('.highlight').removeClass('highlight');
	$('.done').removeClass('done');
	$('#timer-list .row-timer').text('00');
	$('#timer-time').text('Time');
	$('#timer-main').text('Main timer');
	$('#timer-sub').text('Timer to end');
	$('title').text('Timer');
	if (full) {
		$('#play').removeClass('true');
		force = 0;
		pauseTime = false;
		play = false;
	}
}

function pauseTimer() {
	clearInterval(interval);
	pauseTime = new Date();
	$('#play').removeClass('true');
	play = false;
}

function clearTimer() {
	let template = $('#rowTemplate').html();
	$('#timer-list').empty();
	$('#timer-list').append(template);
	stopTimer();
	calcListeners();
}

function createSortable(el) {
	Sortable.create(el, {
		group: 'pile',
		animation: 150,
		handle: '.row-handle',
		invertSwap: true,
		onEnd: calcTimer
	});
}

function format(time) {
	let w = Math.floor(time / (D * 7));
	let d = Math.floor(time / D);
	let h = Math.floor(time / H) % 24;
	let m = Math.floor(time / M) % 60;
	let s = Math.round(time / S) % 60;
	s = s < 10 ? '0' + s : s;
	m = m < 10 ? '0' + m : m;
	return (+d ? d + 'd ' : '') + (+h ? h + ':' : '') + (+m || +h ? m + ':' : '') + s;
}

function hms(h, m, s) {
	return (h * 60 * 60 + m * 60 + s) * 1000;
}
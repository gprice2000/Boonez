var cur_cal;

document.addEventListener('DOMContentLoaded', function() {
	var calendarEl = document.getElementById('calendar');
	publicCal(calendarEl);
	// When the user clicks on the button, open the modal
	document.getElementById("CalBtn")
			.addEventListener("click", function() {
				var btn_val = document.getElementById("CalBtn").innerHTML; 
				if (btn_val == "Public") {
					document.querySelector("#CalBtn").innerHTML = "Private";
					publicCal(calendarEl);
				}
				else {
					document.querySelector("#CalBtn").innerHTML = "Public";
					privateCal(calendarEl);
				}
			});
	
});

function dateFormat(date) {
	if (date == null) return null;
	var month = date.getMonth() + 1; //months from 1-12
	var day = date.getDate();
	var year = date.getFullYear();
	console.log("month length" + month.toString().length)
	console.log("day length" + day.length)

	if (month.toString().length != 2) {
		month = '0'.concat(month);
	}
	if (day.toString().length != 2) {
		day = '0'.concat(day);
	}
	return year + "-" + month + "-" + day;
}
function privateCal(calendarEl) {
		var calendar = new FullCalendar.Calendar(calendarEl, {
			headers: {
				left: 'prev,next today',
			},
			selectable: true,
			eventClick: function(calEvent) {
				console.log(calEvent.start)
				let event = { title: calEvent.event.title,
					id: parseInt(calEvent.event.id),
					start: dateFormat(calEvent.event.start),
				    end: dateFormat(calEvent.event.end) }
				editEvent('pri',event);
			},
			eventSources: [
				{
					url: '/Priv_calendar',
					method: 'GET',
					success: function(res) {
						console.log("Calendar Events received:");
					},
					failure: function() {
						return;
					}
				}
			],

			select: function(info) {
				var title = prompt('Event Title:');
				if (title) {
					let new_event = 
					{
						id: genID(),
						title: title,
						start: info.startStr,
						end: info.endStr,
					};
					this.addEvent(new_event);
					fetch('http://localhost:3000/Priv_calendar', {
						method: 'POST', 
						credentials: 'same-origin',
						mode: 'same-origin',
						headers: {
							'Content-Type' : 'application/json',
						},
						body: JSON.stringify(new_event),
					})
					.then(response => response.json())
					.then(new_event => {
						console.log('Success:');
					})
					.catch((error) => {
						console.error("Error:");
					});
				}

			}
		});
		cur_cal = calendar;
		calendar.render();

}

function publicCal(calendarEl) {
	var calendar = new FullCalendar.Calendar(calendarEl, {
		headers: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},
		selectable: true,
		timeFormat: 'YYYY, MM, DD',
		eventClick: function(calEvent) {
			// Get the modal
			//if (calEvent.end == null)
			console.log(calEvent)
			let event = { title: calEvent.event.title,
				id: parseInt(calEvent.event.id),
				start: dateFormat(calEvent.event.start),
				end: dateFormat(calEvent.event.end) }
				console.log(event)

			editEvent('pub',event);
			console.log("PUBLIC EVENT HAS BEEN CLICKED");

		},
		eventSources: [
			{
				url: '/Pub_calendar',
				method: 'GET',
				success: function(res) {
					pub_arr = res 
					console.log("Calendar Events received:");
				},
				failure: function() {
					alert("There was an error while fetching events");
				}
			}
		],

		select: function(info) {
			var title = prompt('Event Title:');
			
			if (title) {
				let new_event = 
				{
					id: genID(),
					title: title,
					start: info.startStr,
					end: info.endStr,
				};
				this.addEvent(new_event);

				fetch('http://localhost:3000/Pub_calendar', {
					method: 'POST', 
					credentials: 'same-origin',
					mode: 'same-origin',
					headers: {
						'Content-Type' : 'application/json',
					},
					body: JSON.stringify(new_event),
				})
				.then(response => response.json())
				.then(new_event => {
					console.log('Success:');
				})
				.catch((error) => {
					console.error("Error:");
				});
			}
		}
	});
	cur_cal = calendar;
	calendar.render();
}
function genID() {
	return (cur_cal.getEvents()).length;
}

function editEvent(cal_type, info) {

	var modal = document.getElementById("myModal");
	modal.style.display = "block";
	let id = info.id;
	var subBtn = document.getElementById("calSub");
	var delBtn = document.getElementById("calDel");
	let t_q = document.querySelector("#Title");
	let s_q = document.querySelector("#EventStart");
	let e_q = document.querySelector("#EventEnd");
	t_q.value = info.title;
	s_q.value = info.start;
	e_q.value = info.end; 
	subBtn.onclick = function() {

		let title = t_q.value;
		let start = s_q.value;
		let end = e_q.value;
		
		console.log("")
		if (title == '') {
			title = info.title;
		}
		if (start == '' ) {
			start = info.start;
		}
		if (end != '' && start > end) {
			window.alert("Error: Start date has to come before end.");
		}

		console.log(title + "\n" + start + "\n" + end)
		serverCon('POST',{id,cal_type,title,start,end},'/editEvent');

	}
	delBtn.onclick = function() {
		var obj = {id,info, cal_type};
		serverCon('DELETE',obj,'/deleteEvent');
	}
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}
	cur_cal.render();
}

function serverCon(method, data,url) {
	fetch('http://localhost:3000'+url, {
		method: method, 
		credentials: 'same-origin',
		mode: 'same-origin',
		headers: {
			'Content-Type' : 'application/json',
		},
		body: JSON.stringify({data}),
	})
	.then(response => response.json())
	.then(new_event => {
		console.log('Success:');
	})
	.catch((error) => {
		console.error("Error:");
	});
}
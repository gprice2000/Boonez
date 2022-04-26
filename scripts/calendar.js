let cur_cal;
const search = window.location.search;

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
	//cur user

		var calendar = new FullCalendar.Calendar(calendarEl, {
			selectable: true,
			aspectRatio: 2,
			eventClick: function(calEvent) {
				console.log(calEvent.start)
				let event = { title: calEvent.event.title,
					id: parseInt(calEvent.event.id),
					cal_type: "pri",
					start: dateFormat(calEvent.event.start),
				    end: dateFormat(calEvent.event.end) }
				editEvent('pri',event);

			},
			eventSources: [
				{
					url: '/Priv_calendar/'+search,
					method: 'GET',
					success: function(res) {
						console.log("Private Calendar Events received:");
					},
					failure: function() {
						return;
					}
				}
			],

			select: function(info) {
				let new_event = 
				{
					id: genID(),
					title: "",
					cal_type: "pri",
					start: info.startStr,
					end: info.endStr,
				};
				editEvent("pri",new_event)
				//serverCon('POST',new_event,'/pri_calendar')

			}
		});
		
		calendar.render();
		cur_cal = calendar;

}

function publicCal(calendarEl) {

	var calendar = new FullCalendar.Calendar(calendarEl, {
		selectable: true,
		aspectRatio: 2,
		eventChange: function(changeInfo) {
			cur_cal.render()
		},
		eventClick: function(calEvent) {
			// Get the modal
			//if (calEvent.end == null)
			console.log(calEvent)
			let event = { title: calEvent.event.title,
				id: parseInt(calEvent.event.id),
				start: dateFormat(calEvent.event.start),
				cal_type: "pub",
				end: dateFormat(calEvent.event.end) }
				console.log(event)

			editEvent('pub',event);

			console.log("PUBLIC EVENT HAS BEEN CLICKED");

		},
		eventSources: [
			{
				url: '/Pub_calendar/' + search,
				method: 'GET',
				success: function(res) {
					pub_arr = res 
					console.log("Public Calendar Events received:");
				},
				failure: function() {
					alert("There was an error while fetching events");
				}
			}
		],

		select: function(info) {
			//var title = prompt('Event Title:');
			
			let new_event = 
			{
				id: genID(),
				title: "",
				cal_type: "pub",
				start: info.startStr,
				end: info.endStr,
			};
			editEvent("pub",new_event);

			//cur_cal.addEvent(new_event);
			//serverCon('POST',new_event,'/Pub_calendar')
		}
	});
	calendar.render();
	cur_cal = calendar;

}
function genID() {
	return (cur_cal.getEvents()).length + 1;
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
	subBtn.onclick = function(event) {
		event.preventDefault();
		let title = t_q.value;
		let start = s_q.value;
		let end = e_q.value;
		if (start > end) {
			window.alert("Error: Start date has to come before end.");
		}

		console.log(title + "\n" + start + "\n" + end + "\n" + cal_type + "\n" + id)

		modal.style.display = "none";
		let eventfl = cur_cal.getEventById(id);
		console.log("eventfl: " + eventfl)
		if (eventfl != null) {
			eventfl.setStart(start)
			eventfl.setEnd(end)
			eventfl.setProp("title",title)
		} else {
			console.log("before info: " + info.title)
			info.title = title;
			info.start = start;
			info.end = end;
			console.log("info: " + info.title)
			cur_cal.addEvent(info);

		}

		serverCon('POST',{id,cal_type,title,start,end},'/editEvent');

	}
	delBtn.onclick = function(event) {
		event.preventDefault();
		var obj = {id,info, cal_type};
		(cur_cal.getEventById(id)).remove();
		modal.style.display = "none";
		serverCon('DELETE',obj,'/deleteEvent');
	}
	var span = document.getElementById("calclose");

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

async function serverCon(method, data,url) {
	
	await fetch('http://localhost:3000'+url + '/' + search, {
		method: method, 
		credentials: 'same-origin',
		mode: 'same-origin',
		headers: {
			'Content-Type' : 'application/json',
		},
		body: JSON.stringify(data),
	})
	.then(response => response.json())
	.then(new_event => {

	})
	.catch((error) => {
		console.error("Error: " + error);
		/*
		if (method == 'DELETE') {
			console.log("DELETE")
			window.location.replace(window.location.pathname + window.location.search);}
		*/
	});

}
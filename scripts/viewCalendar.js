//input only calendar view here , viewer cannot edit data
let cur_cal;
const search = window.location.search;

document.addEventListener('DOMContentLoaded', function() {
	var calendarEl = document.getElementById('calendar');
	publicCal(calendarEl);
	// When the user clicks on the button, open the modal
	
});

function publicCal(calendarEl) {

	var calendar = new FullCalendar.Calendar(calendarEl, {
		selectable: true,
		aspectRatio: .95,
		eventClick: function(calEvent) {

		},
		eventSources: [
			{
				url: '/Pub_calendar/' + search,
				method: 'GET',
				success: function(res) {
					pub_arr = res 
					console.log("Calendar Events received:");
				},
				failure: function() {
					alert("There was an error while fetching events");
				}
			}
		]
	});
	calendar.render();
	cur_cal = calendar;

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
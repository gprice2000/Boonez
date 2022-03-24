document.addEventListener('DOMContentLoaded', function() {
	var calendarEl = document.getElementById('calendar');

	var calendar = new FullCalendar.Calendar(calendarEl, {
		headers: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},
		selectable: true,
		/*
			Add an eventSources: so we can first check the data
			base if the user has any saved events, if not we 
			simply send an empty events object.
		*/
		eventSources: [
			{
				url: '/calendar',
				method: 'GET',
				success: function(res) {
					console.log("TEST");
				},
				failure: function() {
					alert("There was an error while fetching events");
				}
			}
		],
		select: function(info) {
			var title = prompt('Event Title:');
			console.log(info.startStr);
			console.log(info.endStr);
			if (title) {
				let new_event = 
				{
					title: title,
					start: info.startStr,
					end: info.endStr,
				};
				this.addEvent(new_event);

				fetch('http://localhost:3000/calendar', {
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
	calendar.render();
});
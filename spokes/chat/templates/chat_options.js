chat.template.ChatOptions = '\
		<div id="overlay" style="display:none"></div>\
		<div id="floating-window" style="display:none">\
			<div id="chat-options" class="chatroom">\
				<h3>Chat Options</h3>\
				<form>\
					<label for="user-name">Handle</label>\
					<input id="user-name" name="user-name" type="text" />\
					<div class="clear"></div>\
					<label for="handle-color">Handle Color</label>\
					<select id="handle-color" name="handle-color">\
						<option value="Black">Black</option>\
						<option value="DarkBlue">Blue</option>\
						<option value="DarkMagenta">Magenta</option>\
						<option selected="selected" value="DarkRed">Red</option>\
						<option value="DeepPink">Pink</option>\
					</select>\
					<div class="clear"></div>\
					<label for="text-color">Text Color</label>\
					<select id="text-color" name="text-color">\
						<option selected="selected" value="Black">Black</option>\
						<option value="DarkBlue">Blue</option>\
						<option value="DarkMagenta">Magenta</option>\
						<option value="DarkRed">Red</option>\
						<option value="DeepPink">Pink</option>\
					</select>\
					<div class="clear"></div>\
					<label for="color">Font</label>\
					<select id="font" name="font">\
						<option value="Helvetica">Helvetica</option>\
						<option value="Times New Roman">Times New Roman</option>\
						<option value="Comic Sans MS">Comic Sans MS</option>\
						<option value="Cursive">Cursive</option>\
						<option value="Lucida Grande">Lucida Grande</option>\
					</select>\
					<div class="clear"></div>\
					<button id="save-chat-options-btn" name="save-chat-options-btn">Save</button>\
				</form>\
			</div>\
		</div>\
';
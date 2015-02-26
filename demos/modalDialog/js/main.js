$(function() {
	dialog = new Dialog();
	var button = $('#button');
	button.click(function() {
		dialog.showConfirm({
			b1Callback : function() {
				alert("Button one clicked");
			},
			b2Callback : function() {
				alert("Button two clicked");
			}
		});
	});
});

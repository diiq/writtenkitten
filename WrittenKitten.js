var current_word_count = 0;
var words_for_reward = 100;
var kittens_earned = 0;
var kittens_shown = 0;
var warning_shown = false;
var search_for = 'kitten';

var valid_licenses="4,5,7";

/*
4 - Attribution License (http://creativecommons.org/licenses/by/2.0/)
5 - Attribution-ShareAlike License (http://creativecommons.org/licenses/by-sa/2.0/)
7 - No known copyright restrictions (http://flickr.com/commons/usage/)
*/

var warning;
if (typeof localStorage == "undefined") {
	warning = "#warning-no-ls";
} else {
	warning = "#warning-ls";
}

var next_kitten = {
	img_url: '',
	page_url: '',
	alt: '',
	sharefb: '',
	sharetwitter: ''
};

//Get license info
var license_url = "https://api.flickr.com/services/rest/?format=json&method=flickr.photos.licenses.getInfo&api_key=5dfc80756edad8d0566cf40f0909324e&jsoncallback=?";
var custom_shorts = {"No known copyright restrictions": "Flickr Commons"};
var license_list = [];
$.getJSON(license_url, function(data) {
	if (data.stat == "ok") {
		$.each(data.licenses.license,function(idx,el) {
			licdata = {"name": el.name,"url": el.url};
			//Assign short
			if(shortcc = licdata.url.match(/creativecommons\.org\/licenses\/([^\/]+)\//)) {
			licdata["shortname"] = 'CC-' + shortcc[1].toUpperCase();
			} else if(custshort = custom_shorts[licdata.name]) {
			licdata["shortname"] = custshort;
			} else {
			licdata["shortname"] = licdata.name;
			}
			
			license_list[el.id] = licdata;
		});
	}
});

function word_count(text, wc) {
	if (typeof localStorage != "undefined") {
		localStorage.text = text;
	}
	
	if (current_word_count >= 10 && warning_shown == false) {
		show_warning();
	}
	
	text = text.replace(/^\s*|\s*$/g,''); //removes whitespace from front and end
	text = text.replace(/\s+/g,' '); // collapse multiple consecutive spaces
	var words = text.split(" ");
	wc.value = words.length;
	current_word_count = wc.value = words.length;
	$("#displayWords").html(wc.value);
	kittens_earned = current_word_count / words_for_reward;
	if (kittens_earned >= ((kittens_shown*1)+1)) {
		
		if(current_word_count > 90 && current_word_count < 110){
			if($('#search').val() != search_for){
				search_for = $('#search').val();
			}
			fetch_next_kitten();
		}
		
		show_kitten();
		
	}
}

function show_warning() {
	$(warning).fadeIn("slow");
}

function hide_warning(immediate) {
	if (immediate == true) {
		$(warning).hide();
	} else {
		$(warning).fadeOut("slow");
	}
	warning_shown = true;
}

function show_kitten() {
	hide_warning(true);
	kittens_shown++;
	$("#kittenFrame").css("background-image", "url(" + next_kitten.img_url + ")");
	console.log(next_kitten.img_url);
	$("#kittenCredit").html("<a href='" + next_kitten.page_url + "'>" + next_kitten.alt + "</a><br><a href='" + next_kitten.sharefb + "'>Share on Facebook</a><br><a href='" + next_kitten.sharetwitter + "'>Share on Twitter</a>");
	console.log($("#kittenCredit").html);
	fetch_next_kitten();
}

function fetch_next_kitten() {
	let flickr_search_term
	if (getParameterByName("search")) {
		// if they are using a URL param, take them very literally. They
		// generally know what they're doing.
		flickr_search_term = getParameterByName("search");
	} else {
		// add "cute" to search if item is selected from dropdown. it just
		// works better that way.
		flickr_search_term = search_for + ',cute';
	}

	var flickr_url = "https://api.flickr.com/services/rest/?api_key=0fa41c7f9709b1d850756011e09bbef6&format=json&sort=interestingness-desc&method=flickr.photos.search&license=" + valid_licenses + "&extras=owner_name,license&tags=" + flickr_search_term + "&tag_mode=all&jsoncallback=?";

	$.getJSON(flickr_url, function(data) {
		if (data.stat == "ok") {
			var i = Math.ceil(Math.random() * data.photos.photo.length);
			var photo = data.photos.photo[i];
			console.log(photo);
			if(photo.ownername) {
				if(photo.ownername == "jus10h" || photo.ownername == "evaindia" || photo.ownername == "gailhampshire" || photo.ownername == 'gails_pictures' || photo.ownername.includes('rachel swallow') || photo.ownername == 'falconghost' || photo.ownername == 'sebilden' || photo.title.includes('AI artwork')){
					//console.log('skipping banned owners ' + photo.ownername);
					fetch_next_kitten();
					return false;
				}
			}
			
			var attrib = "";
			if (license = license_list[photo.license]) {
				if (license.url) {
					attrib = " (<a href=\"" + license.url + "\">" + license.shortname + "</a>)";
				} else {
					attrib = " (" + license.shortname + ")";
				}
			}
			next_kitten.img_url = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_z.jpg";
			next_kitten.page_url = "http://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
			next_kitten.alt = photo.title + " by " + photo.ownername + attrib;
			next_kitten.sharefb = 'https://www.facebook.com/sharer.php?u=' + next_kitten.page_url;
			next_kitten.sharetwitter = 'https://twitter.com/intent/tweet?url=' + next_kitten.page_url + '&text=Check out the cute ' + search_for + ' I found on writtenkitten.co!';
			$("#nextKitten").attr("src", next_kitten.img_url);
		}
	});
}

function set_reward(howmany) {
	words_for_reward = howmany;
	kittens_earned = current_word_count / howmany;
	kittens_shown = parseInt(kittens_earned);
}

function set_search(searchTerm) {
	if (tmp = getParameterByName("search")) {
		tmp.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // sanitize
		search_for = tmp;
	} else {
		search_for = searchTerm
	}
	
	set_title();
}

function set_title() {
	if (search_for != "kitten") {
		$("#titleKitten").html("<strike>Kitten!</strike>");
		$("#titleSearch").html("&nbsp;" + search_for + "!");
	}
	else {
		$("#titleKitten").html("Kitten!");
		$("#titleSearch").html("");
	}
}

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if (results == null) {
		return "";
	} else {
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}

function restore_text() {
	if (typeof localStorage != "undefined") { 
		$("#writearea").attr("value", localStorage.text);
	}
}

function tabs(e) {
	if(e.keyCode === 9) { // if tab
		var el = e.target;

		// get caret position or selection
		var start = el.selectionStart;
		var end = el.selectionEnd;
		
		var value = el.value;
		
		// set text to: text before caret + tab + text after caret
		el.valuse = value.substring(0, start
					+ "\t"
					+ value.substring(end));
		
		// reset caret position
		el.selectionStart = el.selectionEnd = start + 1;
		
		// keep focus
		e.preventDefault();
	}
}

function initPage() {
	set_search($('#search').val());
	set_title();
	restore_text();
}

//object and constructor
var ad = {}
function Ad(adID, title, text, company, date) {
    this.adID = adID;
    this.title = title;
    this.text = text;
    this.company = company;
    this.date = formatDate(new Date(date));
}

//save data action
function SaveAd() {
    var modal = $('#saveModal');
    var adID = modal.find('#adID').val();
    var title = modal.find('#title').val();
    var text = modal.find('#text').val();
    var company = modal.find('#company').val();
    var ad = new Ad(adID, title, text, company, Date.now());
    Ajax("POST", "/save", JSON.stringify(ad), function (result) {
        RefreshAds();
        $('#saveModal').hide();
        Aalert(result, false);
    }, function (err) {
        Aalert(err, true);
    }, function (a) {
        RefreshAds();
        $('#saveModal').hide();
    })
}

//get single data action
function OpenSaveModal(id) {
    var modal = $('#saveModal');
    if (id === 0) {
        modal.find('#saveModal-label').html('Dodavanje oglasa');
        modal.find('#adID').val(0);
        modal.find('#title').val('');
        modal.find('#text').val('');
        modal.find('#company').val('');
        modal.find('#date').val('');
        $('#saveModal').show();
    } else if (id > 0) {
        Ajax("GET", "/edit/" + id, null, function (result) {
            var ad = JSON.parse(result);
            modal.find('#saveModal-label').html('Izmena oglasa');
            modal.find('#adID').val(parseInt(ad.adID));
            modal.find('#title').val(ad.title);
            modal.find('#text').val(ad.text);
            modal.find('#company').val(ad.company);
            modal.find('#date').val(ad.date);
            $('#saveModal').show();
        }, function (err) {
            Aalert(err, true);
        })


    }
}

//delete action
function Delete(id) {
    var http = new XMLHttpRequest();
    var url = "/delete";
    var params = "id=" + id;
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.onreadystatechange = function () { //Call a function when the state changes.
        if (http.readyState === 4 && http.status === 200) {
            Aalert(http.responseText, false);
            RefreshAds();
        }
    }
    http.send(params);
}

$(document).ready(function () {
    $('.closeModal').on('click', function () {
        $('.myModal').hide();
    })
});

//set date format
function formatDate(currentdate) {
    return "Postavljeno: " + currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getFullYear() + " u " + currentdate.getHours() + ":" + currentdate.getMinutes();
}


//refreshing data on page
function RefreshAds() {
    Ajax("GET", "/data", null, function (result) {
        var data = JSON.parse(result);
        $('#AdsContainer').html('');
        $.each(data.data, function (i, l) {
            var html = '<div class="w3l w3-agile-width"><div class="modal-content modal-info"><div class="modal-header">' +
                '<h3>' + l.title + '</h3>' +
                '</div><div class="modal-body-w3layouts register-height-w3ls"><p>' +
                l.text +
                '</p></div><div class="modal-footer"><div class="info"><ul>' +
                '<li>' + l.company + '</li>' +
                '<li>' + l.date + '</li>' +
                '</ul></div><div class="actions"><ul>' +
                '<li><a title="Izmeni oglas" onclick="OpenSaveModal(' + l.adID + ')" class="twitter"><i class="fa fa-pencil" aria-hidden="true"></i></a></li>' +
                '<li><a title="Obriši oglas" onclick="Delete(' + l.adID + ')" class="googleplus"><i class="fa fa-times" aria-hidden="true"></i></a></li>' +
                '</ul></div></div><div class="clear"></div></div>';

            $('#AdsContainer').append(html + '  <div class="clear"></div>');
        });
    }, function (err) {
        Aalert(err, true);
    }, null)

}

//ajax helper
function Ajax(method, action, data, success, fail, always) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                success(xmlhttp.responseText)
            } else if (xmlhttp.status == 400) {
                if (fail)
                    fail(xmlhttp.responseText)
            } else {
                if (always)
                    always(xmlhttp.responseText)
            }
        }
    };
    xmlhttp.open(method, action, true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send(data);
}

//custom alert
function Aalert(txt, isFail) {
    $('#alert').removeClass('fail,success');
    if (isFail) {
        $('#alert').addClass('fail');
    } else {
        $('#alert').addClass('success');
    }
    $('#alert p').html(txt);
    $("#alert").show().delay(2000).fadeOut();
}
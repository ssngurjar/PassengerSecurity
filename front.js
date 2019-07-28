
     var output = document.getElementById('NEXTHALT');
    function getRoute(){
    alert("reached in the function");
    var PNR=document.getElementById('PNR').value;
    arr1={"PNR":PNR};
     $.post("./getroute",arr1,
        function(rows)
        {
         alert(rows[0]);
         // var output = document.getElementById('NEXTHALT');
          for (var i=0; i<rows.length; i++) {
        output.innerHTML+='<option value="'+rows[i]+'">"'+rows[i]+'"</option>';
        }  
        });
   }
      
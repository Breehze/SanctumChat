
const modal = document.getElementById('myModal')
const openButton = document.getElementById('myBtn')
const closeButton = modal.querySelector('button')

openButton.addEventListener('click', function () {
    modal.classList.remove('invisible')
    modal.classList.add('visible');
  });

closeButton.addEventListener('click', function () {
    modal.classList.remove('visible');
    modal.classList.add('invisible')
})




var modal2 = document.getElementById("upload-pfp");


var btn2 = document.getElementById("pfpimg");



btn2.onclick = function() {
  modal2.classList.remove('invisible');
  modal2.classList.add('visible')
}


window.onclick = function(event) {
  if (event.target == modal2 || event.target == modal) {

    modal2.classList.remove('visible');
    modal2.classList.add('invisible')

    modal.classList.remove('visible');
    modal.classList.add('invisible')
  }
}

document.getElementById("upload-pfp-form").addEventListener("submit", function(event) {
  event.preventDefault(); 

  const fileInput = document.querySelector('input[type="file"]');
  const file = fileInput.files[0]; 

  const formData = new FormData();
  formData.append("file", file);

  
  fetch("/uploadfile", {
    method: "POST",
    body: formData
  })
  .then(response => {
    if (response.ok) {
      
      modal2.classList.remove('visible');
      modal2.classList.add('invisible')
      
      console.log("File uploaded successfully");
    } else {
      
      console.error("Error uploading file");
    }
  })
  .catch(error => {
    
    console.error("Error:", error);
  });
});





require('./styles.styl');

const jobForm = document.querySelector('#newjob');

if (jobForm) {
  const submitButton = document.querySelector('#submitButton');
  submitButton.addEventListener('click',function submitForm(event) {
    console.log('submit', event);

    if(!jobForm.title.value) {
      jobForm.title.style.border = '1px solid red';
      return;
    } else {
      jobForm.title.style.border = '1px solid black';
    }

    if(!jobForm.description.value) {
      jobForm.description.style.border = '1px solid red';
      return;
    } else {
      jobForm.description.style.border = '1px solid black';
    }
    submitButton.disabled = true;

    fetch('/jobs/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: jobForm.title.value,
        description: jobForm.description.value
      })
    })
    .then(r => r.json())
    .then(r => window.location = '/jobs/' + r._id + '/')
    .catch(e => {
      console.log(e);
      alert('Произошла ошибка');
      submitButton.disabled = false;
    });
  });

  console.log(jobForm.title, jobForm.description);
}

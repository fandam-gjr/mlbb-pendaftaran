let currentStep = 1;

function showStep(step) {
  document.querySelectorAll('.form-step').forEach((el, i) => {
    el.classList.toggle('active', i === step - 1);
  });
}

function nextStep(step) {
  const error = validateStep(step);
  if (!error) {
    currentStep++;
    showStep(currentStep);
  }
}

function prevStep(step) {
  currentStep--;
  showStep(currentStep);
}

function validateStep(step) {
  let valid = true;
  let errorElement = document.querySelector(`#step${step} .error`);
  errorElement.textContent = "";

  if (step === 1) {
    const teamName = document.getElementById('teamName').value.trim();
    if (!teamName) {
      errorElement.textContent = "Silakan lengkapi terlebih dahulu.";
      valid = false;
    }
  }

  if (step === 2) {
    const discords = document.querySelectorAll('.discord');
    const mlbbs = document.querySelectorAll('.mlbb');
    for (let i = 0; i < 5; i++) {
      if (!discords[i].value.trim() || !mlbbs[i].value.trim()) {
        errorElement.textContent = "Silakan lengkapi semua pemain.";
        valid = false;
        break;
      }
    }
  }

  if (step === 3) {
    const logo = document.getElementById('logoUpload').files[0];
    if (!logo) {
      errorElement.textContent = "Silakan upload logo tim.";
      valid = false;
    } else if (!['image/png', 'image/jpeg'].includes(logo.type)) {
      errorElement.textContent = "Logo harus JPG atau PNG.";
      valid = false;
    }
  }

  return !valid;
}

document.getElementById('registrationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateStep(3)) return;

  const submitBtn = document.getElementById('submitBtn');
  const backBtn = document.getElementById('backBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const loader = submitBtn.querySelector('.loader');

  submitBtn.disabled = true;
  backBtn.style.display = 'none';
  btnText.style.display = 'none';
  loader.style.display = 'inline-block';

  const logo = document.getElementById('logoUpload').files[0];
  const imageData = new FormData();
  imageData.append("image", logo);

  let imgurUrl = null;
  try {
    const res = await fetch('https://api.imgbb.com/1/upload?key=42eb1f905526b4f8d2b1355dedc76083', {
      method: "POST",
      body: imageData
    });
    const data = await res.json();
    imgurUrl = data.data.url;
  } catch {
    document.querySelector('#step3 .error').textContent = "Gagal upload logo.";
    submitBtn.disabled = false;
    backBtn.style.display = 'inline-block';
    btnText.style.display = 'inline';
    loader.style.display = 'none';
    return;
  }

  if (!imgurUrl) return;

  const payload = {
    content: "**Pendaftaran Baru!**",
    embeds: [{
      title: document.getElementById('teamName').value,
      fields: Array.from({ length: 5 }, (_, i) => ({
        name: `Player ${i + 1}`,
        value: `Discord: ${document.querySelectorAll('.discord')[i].value}\nMLBB ID: ${document.querySelectorAll('.mlbb')[i].value}`,
        inline: false
      })),
      image: { url: imgurUrl }
    }]
  };

  await fetch("https://discord.com/api/webhooks/1358075307764093130/y5kH7hNHu5BP-uoo52NghzYB0dIQUBQPo8gqr7_uUipy5LAo--y5LSzSbbvOQ8CG4sMJ", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  currentStep = 4;
  showStep(currentStep);
});

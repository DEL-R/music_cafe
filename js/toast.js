function ToastBuilder(options) {
  const opts = options || {};
  opts.defaultText = opts.defaultText || 'default text';
  opts.displayTime = opts.displayTime || 3000;
  opts.target = document.querySelector(opts.target || 'body');

  return function (text) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerHTML = text || opts.defaultText;
    opts.target.prepend(toast);

    // Position toasts
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      let topOffset = 15;
      document.querySelectorAll('.toast').forEach(t => {
        t.style.top = `${topOffset}px`;
        topOffset += t.offsetHeight + 15;
      });
    });

    // Hide and remove toast
    setTimeout(() => {
      toast.style.right = `-${toast.offsetWidth + 20}px`;
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 600); // Wait for transition to finish
    }, opts.displayTime);
  };
}

// customize it with your own options
var myOptions = {
defaultText: 'If you\'re seeing this, something went wrong.',
displayTime: 10000,
target: 'body'
};

const defaultmessage_list = [
    "Welcome to [Lofi Cafe]! ☕ We hope you enjoy your stay! ^^",
    'Stay tuned for more updates and join the community: <a href="https://discord.gg/zNCjB9DJ9z" target="_blank">https://discord.gg/zNCjB9DJ9z</a> 🎶',
];

const showtoast = new ToastBuilder(myOptions);

document.addEventListener('DOMContentLoaded', function play_default() {
  defaultmessage_list.forEach((message, i) => {
    setTimeout(() => {
      showtoast(message);
    }, i * 1500);
  });
});

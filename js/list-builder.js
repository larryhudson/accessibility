// instantiate the copy button
new Clipboard('.c-guidelines__copy');

(function(container){ // write some JS

  if (!container) {
    return false;
  }

  var sections = {
    designers: "Designers",
    editorial: "Editorial",
    engineers: "Engineers",
    project: "Project Managers",
    qa: "Quality Assurance",
    tools: "Tools"
  }

  var formatters = {
    github: "\n- [ ] ",
    markdown: "\n - ",
    plaintext: "\n"
  };

  var checkboxes = $$('input[type="checkbox"]');
  var textarea = container.querySelector('.preview-box');
  var floatyButton = document.querySelector('.c-guidelines__floaty-button');
  var outputType;

  // An active element is an array of 2 strings
  // the first string is the list item text
  // the second string is the id of the label wrapping the checkbox
  var active = [];

  function saveActive() {
    var serialized = active.map(function(arr) {
      return arr.join("__");
    });

    localStorage.setItem('previewSelections', serialized.join('|'));
  }

  function retrieveActive() {
    var existing = localStorage.getItem('previewSelections');
    if (existing) {
      existing = existing.split('|').map(function(sel){
        return sel.split("__")
      });
    }

    return existing;
  }

  function highlightCheckboxes() {
    active.forEach(function(box){
      document.querySelector('#' + box[1] + ' input').checked = true;
    })
  }

  function formatPreview(start) {
    var activeSection = "";

    return active.reduce(function(prev, curr, idx){
      var currentSection = curr[1].split("-")[0];
      var str = "";

      if (activeSection !== currentSection ) {
        activeSection = currentSection;
        if (prev !== curr) {
          str = outputType === "plaintext" ? "\n\n" : "\n\n## ";
        } else {
          str = outputType === "plaintext" ? str : "## "
        }
        str += sections[activeSection];
      }

      str += start + curr[0];

      if (outputType !== "plaintext") {
        str = str + " [More Info](" + window.location.href + "#" + curr[1] + ")";
      }

      // if there is extra elements
      if (curr[2]) {
        str += curr[2];
      }

      return idx > 0 ?  prev + str : str;
    }, active[0]);
  }

  function formatExtraLinks(el) {
    var links = $$('a', el);
    var start = formatters[outputType];
    var result = [];
    links.forEach(function(link) {
      if (outputType === 'plaintext') {
        result.push(start + link.innerText + ': ' + link.href);
      } else {
        result.push(start + '[' + link.innerText + '](' + link.href + ')');
      }
    });
    return result.join();
  }

  function outputPreview() {
    if (!active.length) {
      return false;
    }
    textarea.value = formatPreview(formatters[outputType]);
  }

  function rebuildActive() {
    var newActive = [];
    checkboxes.forEach(function(c) {
      if (c.checked) {
        var extra = null;

        if (c.getAttribute('data-include-links')) {
          extra = formatExtraLinks(document.querySelector(c.getAttribute('data-include-links')));
        }
        // [description of the item, id for the label (for anchor links), extra info]
        var deets = [c.parentNode.querySelector('p').innerText, c.parentNode.id, extra]
        newActive.push(deets);
      }
    });
    active = newActive;
    saveActive();
    outputPreview();
  }

  document.addEventListener('navStateChange', function(ev) {
    if (ev.detail.active && active.length) {
      floatyButton.style.display = "block";
    } else if (!ev.detail.active) {
      floatyButton.style.display = "none";
    }
  });

  $$('[name="output_type"]').forEach(function(input) {
    if (input.checked) {
      outputType = input.value;
    }

    input.addEventListener('change', function(ev) {
      outputType = ev.target.value;
      outputPreview();
    });
  });

  checkboxes = checkboxes.map(function(input) {
    if (input.getAttribute('data-skip')) {
      return false;
    }

    input.addEventListener('change', rebuildActive);
    return input;
  });

  // On init check localStorage to see if the person
  // has previously visited, if so return things
  // to the way they left things
  var previousSelections = retrieveActive();
  if (previousSelections) {
    active = previousSelections;
    highlightCheckboxes();
    rebuildActive();
  }

 })(document.querySelector('.c-guidelines'));

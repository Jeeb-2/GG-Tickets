jQuery(function(s){var t=ur_password_strength_meter_params.pwsL10n,r={init:function(){var t=this;s(document.body).on("keyup change",'input[name="user_pass"], .user-registration-EditAccountForm input[name="password_1"], input[name="password_1"].user-registration-Input--password,.user-registration-ResetPassword input[name="password_1"]',function(){""!==s(this).closest("form").attr("data-enable-strength-password")&&t.strengthMeter(s(this))})},strengthMeter:function(t){var e=t.closest("form"),a=s(t,e);r.includeMeter(e,a),r.checkPasswordStrength(e,a)},includeMeter:function(t,r){var e=t.attr("data-minimum-password-strength"),a=t.find(".user-registration-password-strength"),n=t.find(".password-input-group");if(""===r.val())a.remove(),s(document.body).trigger("ur-password-strength-removed");else if(0===a.length){var i='<div class="user-registration-password-strength" aria-live="polite" data-min-strength="'+e+'"></div>';t.hasClass("register")?n.closest(".field-user_pass").after(i):s("#password_1").closest(".password-input-group").after(i),s(document.body).trigger("ur-password-strength-added")}},checkPasswordStrength:function(s,r){var e=s.find(".user-registration-password-strength"),a=s.find(".user-registration-password-hint"),n='<small class="user-registration-password-hint">'+ur_password_strength_meter_params.i18n_password_hint+"</small>",i=s.find('input[type="submit"].user-registration-Button'),o=s.attr("data-minimum-password-strength"),d=[];(d="function"==typeof wp.passwordStrength.userInputDisallowedList?wp.passwordStrength.userInputDisallowedList():wp.passwordStrength.userInputBlacklist()).push(s.find('input[data-id="user_email"]').val()),d.push(s.find('input[data-id="user_login"]').val());var p=wp.passwordStrength.meter(r.val(),d);switch(e.removeClass("short bad good strong"),a.remove(),s.find(".user-registration-password-strength").attr("data-current-strength",p),p>=o?i.prop("disabled",!1):i.prop("disabled",!0),p){case 0:e.addClass("short").html(t.shortpw),e.after(n);break;case 1:e.addClass("bad").html(t.bad),e.after(n);break;case 2:e.addClass("good").html(t.good),e.after(n);break;case 3:case 4:e.addClass("strong").html(t.strong);break;case 5:e.addClass("short").html(t.mismatch)}return p}};r.init()});
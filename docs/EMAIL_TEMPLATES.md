# Templates Email ComHotel pour Supabase

> Guide complet pour configurer les emails dans Supabase Dashboard

---

## Configuration dans Supabase Dashboard

### Accès aux templates

1. Connectez-vous à [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet ComHotel
3. Allez dans **Authentication** → **Email Templates**

---

## Template 1: Confirmation d'inscription

### Supabase: "Confirm signup"

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmez votre compte ComHotel</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                🏨 ComHotel
              </h1>
              <p style="margin: 10px 0 0; color: #bfdbfe; font-size: 14px;">
                Votre partenaire de voyage
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Bienvenue sur ComHotel ! 🎉
              </h2>

              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Merci de vous être inscrit. Pour activer votre compte et commencer à réserver les meilleurs hôtels, veuillez confirmer votre adresse email.
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 16px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      ✓ Confirmer mon email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Ou copiez ce lien dans votre navigateur :
              </p>
              <p style="margin: 10px 0 20px; padding: 12px; background-color: #f3f4f6; border-radius: 4px; word-break: break-all; color: #2563eb; font-size: 12px;">
                {{ .ConfirmationURL }}
              </p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                  ⏱️ Ce lien expire dans <strong>24 heures</strong>.
                </p>
                <p style="margin: 10px 0 0; color: #9ca3af; font-size: 13px;">
                  Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © 2026 ComHotel - Tous droits réservés
              </p>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 11px;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Subject (Objet):**
```
Confirmez votre compte ComHotel 🏨
```

---

## Template 2: Réinitialisation de mot de passe

### Supabase: "Reset password"

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe ComHotel</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                🏨 ComHotel
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                🔐 Réinitialisation de mot de passe
              </h2>

              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 16px 32px; background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                      🔑 Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Ou copiez ce lien :
              </p>
              <p style="margin: 10px 0 20px; padding: 12px; background-color: #f3f4f6; border-radius: 4px; word-break: break-all; color: #2563eb; font-size: 12px;">
                {{ .ConfirmationURL }}
              </p>

              <div style="margin-top: 30px; padding: 16px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  ⚠️ <strong>Important :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre compte reste sécurisé.
                </p>
              </div>

              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 13px;">
                ⏱️ Ce lien expire dans <strong>1 heure</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © 2026 ComHotel - Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Subject (Objet):**
```
🔐 Réinitialisation de votre mot de passe ComHotel
```

---

## Template 3: Magic Link (Connexion sans mot de passe)

### Supabase: "Magic Link"

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connexion à ComHotel</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                🏨 ComHotel
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                ✨ Votre lien de connexion
              </h2>

              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Cliquez sur le bouton ci-dessous pour vous connecter instantanément à votre compte ComHotel.
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 16px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                      🚀 Me connecter maintenant
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 13px;">
                ⏱️ Ce lien expire dans <strong>10 minutes</strong>.
              </p>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 13px;">
                Si vous n'avez pas demandé ce lien, ignorez cet email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © 2026 ComHotel - Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Subject (Objet):**
```
✨ Votre lien de connexion ComHotel
```

---

## Template 4: Changement d'email

### Supabase: "Change Email Address"

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmez votre nouvel email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                🏨 ComHotel
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                📧 Confirmer votre nouvelle adresse email
              </h2>

              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Vous avez demandé à changer votre adresse email. Cliquez sur le bouton ci-dessous pour confirmer ce changement.
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 16px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      ✓ Confirmer le changement
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 30px; padding: 16px; background-color: #fefce8; border-radius: 8px; border-left: 4px solid #eab308;">
                <p style="margin: 0; color: #854d0e; font-size: 14px;">
                  ⚠️ Si vous n'avez pas demandé ce changement, contactez-nous immédiatement.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © 2026 ComHotel - Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Subject (Objet):**
```
📧 Confirmez votre nouvelle adresse email - ComHotel
```

---

## Template 5: Confirmation de réservation (Custom - Backend)

Ce template est à utiliser dans le backend NestJS pour envoyer les confirmations de réservation.

### Fichier: `apps/backend/src/templates/booking-confirmation.html`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de réservation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                🏨 ComHotel
              </h1>
              <p style="margin: 15px 0 0; color: #a7f3d0; font-size: 18px; font-weight: 500;">
                ✓ Réservation confirmée !
              </p>
            </td>
          </tr>

          <!-- Booking Reference -->
          <tr>
            <td style="padding: 30px 40px 20px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Numéro de réservation</p>
              <p style="margin: 5px 0 0; color: #1f2937; font-size: 28px; font-weight: 700; letter-spacing: 2px;">
                {{BOOKING_REF}}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <p style="margin: 0 0 25px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>{{GUEST_NAME}}</strong>,<br><br>
                Votre réservation est confirmée. Voici les détails :
              </p>

              <!-- Hotel Info -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px;">
                  🏨 {{HOTEL_NAME}}
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Chambre</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{{ROOM_TYPE}} - N°{{ROOM_NUMBER}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Arrivée</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">📅 {{CHECK_IN}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Départ</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">📅 {{CHECK_OUT}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Voyageurs</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">👥 {{GUESTS}} personne(s)</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Nuits</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">🌙 {{NIGHTS}} nuit(s)</td>
                  </tr>
                </table>
              </div>

              <!-- Price Summary -->
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; border-left: 4px solid #2563eb;">
                <h3 style="margin: 0 0 15px; color: #1e40af; font-size: 16px;">
                  💰 Récapitulatif du prix
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Prix par nuit</td>
                    <td style="padding: 5px 0; color: #1f2937; font-size: 14px; text-align: right;">{{PRICE_PER_NIGHT}} €</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Sous-total ({{NIGHTS}} nuits)</td>
                    <td style="padding: 5px 0; color: #1f2937; font-size: 14px; text-align: right;">{{SUBTOTAL}} €</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Taxes (10%)</td>
                    <td style="padding: 5px 0; color: #1f2937; font-size: 14px; text-align: right;">{{TAXES}} €</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 10px; border-top: 1px solid #dbeafe;"></td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #1e40af; font-size: 18px; font-weight: 700;">Total</td>
                    <td style="padding: 5px 0; color: #1e40af; font-size: 18px; font-weight: 700; text-align: right;">{{TOTAL}} €</td>
                  </tr>
                </table>
              </div>

              <!-- CTA -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="{{BOOKING_URL}}"
                       style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
                      📋 Voir ma réservation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Hotel Contact -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <h4 style="margin: 0 0 10px; color: #1f2937; font-size: 14px;">Contact de l'hôtel</h4>
                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                  📍 {{HOTEL_ADDRESS}}<br>
                  📞 {{HOTEL_PHONE}}<br>
                  ✉️ {{HOTEL_EMAIL}}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px; color: #4b5563; font-size: 13px;">
                Besoin d'aide ? Contactez-nous à <a href="mailto:support@comhotel.com" style="color: #2563eb;">support@comhotel.com</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                © 2026 ComHotel - Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 6: Annulation de réservation (Custom - Backend)

### Fichier: `apps/backend/src/templates/booking-cancellation.html`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Annulation de réservation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                🏨 ComHotel
              </h1>
              <p style="margin: 15px 0 0; color: #d1d5db; font-size: 18px; font-weight: 500;">
                Réservation annulée
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 25px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>{{GUEST_NAME}}</strong>,<br><br>
                Nous confirmons l'annulation de votre réservation.
              </p>

              <!-- Booking Info -->
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Référence</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">{{BOOKING_REF}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Hôtel</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">{{HOTEL_NAME}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Dates prévues</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">{{CHECK_IN}} - {{CHECK_OUT}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Raison</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">{{CANCELLATION_REASON}}</td>
                  </tr>
                </table>
              </div>

              <!-- Refund Info -->
              <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; border-left: 4px solid #dc2626;">
                <h4 style="margin: 0 0 10px; color: #991b1b; font-size: 14px;">
                  💳 Information de remboursement
                </h4>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px;">
                  {{REFUND_INFO}}
                </p>
              </div>

              <!-- CTA -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="{{HOTELS_URL}}"
                       style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
                      🔍 Rechercher un autre hôtel
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © 2026 ComHotel - Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Configuration SMTP Production

Pour la production, configurez votre SMTP dans Supabase :

### Option 1: Gmail (développement uniquement)
```
Host: smtp.gmail.com
Port: 587
Username: votre-email@gmail.com
Password: mot-de-passe-application
```

### Option 2: SendGrid (recommandé production)
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: votre-api-key-sendgrid
```

### Option 3: Brevo (anciennement Sendinblue)
```
Host: smtp-relay.brevo.com
Port: 587
Username: votre-email
Password: votre-smtp-key
```

---

## Variables disponibles dans Supabase

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | Lien de confirmation |
| `{{ .Token }}` | Token brut |
| `{{ .TokenHash }}` | Hash du token |
| `{{ .SiteURL }}` | URL du site |
| `{{ .Email }}` | Email de l'utilisateur |

---

## Checklist d'implémentation

- [ ] Créer les templates dans Supabase Dashboard
- [ ] Configurer les sujets d'email
- [ ] Tester l'inscription avec confirmation
- [ ] Tester le mot de passe oublié
- [ ] Configurer SMTP production
- [ ] Implémenter l'envoi d'email de réservation dans le backend
- [ ] Implémenter l'envoi d'email d'annulation dans le backend

---

*Templates ComHotel - Janvier 2026*

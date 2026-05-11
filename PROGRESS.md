# SchoolPilot Mobile — Avancement

> App mobile React Native (Expo) pour l'espace **Parent** du projet SchoolPilot.
> Ce fichier est mis à jour à la fin de chaque session pour que le travail puisse reprendre sans perte de contexte.

---

## Identité du projet

- **Nom** : SchoolPilot Mobile
- **Branche Git** : `feat/mobile-app-parent` (à merger dans `develop` après validation)
- **Stack** : Expo (SDK récent) + React Native + TypeScript + React Navigation + TanStack Query + Axios + expo-secure-store
- **Backend** : même API que le frontend web (`http://45.92.111.211:5053`), endpoints `/parent/*` et `/auth/*`
- **Périmètre** : uniquement l'espace parent (9 écrans). Pas d'admin, pas d'employés.

---

## Session 5 — 2026-04-16

### ✅ Réalisé

**Charte graphique alignée sur Innovation Code**
- Couleurs principales reprises de [frontend/src/styles/variables.css](frontend/src/styles/variables.css) :
  - **Orange** `#D86430` (logo) → `colors.primary` (CTA, tabs actifs, accents)
  - **Bleu** `#2E7AB8` (logo) → `colors.secondary` (chrome, brand, infos)
- Statuts alignés sur la palette Ant Design utilisée par le web (success `#52C41A`, warning `#FAAD14`, danger `#F5222D`, info `#1890FF`)
- Grays alignés sur `--gray-50` à `--gray-900`
- `app.json` : splash + adaptive icon background passent en orange
- Channel notifications Android passe également en orange

**Logique de mix orange / bleu** (cohérente avec la landing web)
- **Orange = action** : boutons CTA, tabs actifs, KPIs principaux
- **Bleu = identité / chrome** : headers de stack, brand "SchoolPilot", boutons secondaires (bordure bleue), avatars compte, icônes du menu Plus, KPIs secondaires

**Refonte du LoginScreen**
- Hero bleu plat (sans gradient — décision validée pour éviter l'effet "vibe coded")
- Logo carré blanc avec icône école orange (rappel des deux couleurs de marque)
- Brand "SchoolPilot" + tagline "Espace Parent" centrés
- Carte de connexion blanche avec ombre, espace de 16px sous le hero
- Inputs avec icônes intégrées (mail / cadenas)
- Toggle œil pour afficher/masquer le mot de passe
- Lien "Mot de passe oublié ?" placé sous le champ password
- Séparateur "ou" + bouton "Créer un compte parent" en bordure bleue
- Footer discret pour le contact admin

**Composant `Input` enrichi (réutilisable partout)**
- Prop `leftIcon` (nom Ionicons) → icône à gauche du champ
- Prop `togglePassword` → ajoute un bouton œil masquer/afficher
- Prop `rightSlot` → slot custom à droite

### Reste à faire pour l'auth

- [ ] Appliquer le même traitement (icônes leftIcon) aux écrans `RegisterScreen` et `ForgotPasswordScreen` pour cohérence visuelle
- [ ] Hero bleu compact (juste brand) sur Register et ForgotPassword si pertinent

---

## Session 4 — 2026-04-16

### ✅ Réalisé

**Refonte de la navigation (option B)**
Anciens tabs : Accueil / Enfants / Préinscriptions / Finance / Plus
Nouveaux tabs : **Accueil / Scolarité / Messages / Finance / Plus**
- Justification : Communications et Scolarité sont consultés au quotidien. Préinscriptions (annuel) et Enfants (consultation occasionnelle) sont déplacés dans "Plus".
- Badge dynamique sur l'onglet Messages : nombre de messages non lus (refresh toutes les 60s)

**Communications**
- API : [communicationApi.ts](mobile/src/api/communicationApi.ts) (annonces, messages, fil de discussion, marquage lu, accusé réception)
- [CommunicationsScreen](mobile/src/screens/parent/CommunicationsScreen.tsx) avec tabs Annonces / Messages, indicateurs non-lu, badges accusé requis
- [AnnouncementDetailScreen](mobile/src/screens/parent/AnnouncementDetailScreen.tsx) avec marquage auto-lu et bouton "Accuser réception"
- [MessageDetailScreen](mobile/src/screens/parent/MessageDetailScreen.tsx) avec affichage du fil de discussion complet (thread)

**Calendrier / événements**
- API : [calendarApi.ts](mobile/src/api/calendarApi.ts) (à venir, aujourd'hui, en cours, par mois, jours fériés, examens, réunions parents)
- [CalendarScreen](mobile/src/screens/parent/CalendarScreen.tsx) : section "Aujourd'hui" + liste groupée par mois, badges inscription, icônes par type
- [EventDetailScreen](mobile/src/screens/parent/EventDetailScreen.tsx) avec détails + lieu + organisateur + statut inscription

**Scolarité (ossature pédagogique complète)**
- Contexte global [SelectedChildContext](mobile/src/contexts/SelectedChildContext.tsx) : enfant sélectionné partagé entre tous les écrans Scolarité
- Composant [ChildSwitcher](mobile/src/components/ChildSwitcher.tsx) : sélecteur d'enfant (avatar + nom + classe), modal bottom-sheet si plusieurs enfants
- [ScolariteHomeScreen](mobile/src/screens/parent/academic/ScolariteHomeScreen.tsx) : grille de 5 tuiles vers les sous-sections
- 5 écrans pédagogiques branchés sur les endpoints existants :
  - [NotesScreen](mobile/src/screens/parent/academic/NotesScreen.tsx) : moyenne générale + moyennes par matière + notes détaillées + sélecteur de période
  - [BulletinsScreen](mobile/src/screens/parent/academic/BulletinsScreen.tsx) : liste des bulletins avec téléchargement PDF
  - [DevoirsScreen](mobile/src/screens/parent/academic/DevoirsScreen.tsx) : ⚠ stub fonctionnel — l'endpoint backend `/cahiers-texte/classe/{classeId}/devoirs` nécessite l'ID classe que `ChildSummary` n'expose pas. Affiche un message clair "endpoint à créer côté backend"
  - [AbsencesScreen](mobile/src/screens/parent/academic/AbsencesScreen.tsx) : stats assiduité + historique avec icônes/badges justifiée/non
  - [EmploiDuTempsScreen](mobile/src/screens/parent/academic/EmploiDuTempsScreen.tsx) : ⚠ même limitation que Devoirs — affiche message "endpoint à créer"
- API : [academicApi.ts](mobile/src/api/academicApi.ts) (notes, moyennes, bulletins, absences, stats, périodes, emploi du temps, cahier de textes)

**Notifications push**
- Dépendances : `expo-notifications`, `expo-device`
- Service [pushNotifications.ts](mobile/src/services/pushNotifications.ts) : demande permission, récupère token Expo Push, configure canal Android, envoie token au backend
- Hook [usePushNotifications](mobile/src/hooks/usePushNotifications.ts) : enregistrement automatique au login, listeners de réception et tap, navigation contextuelle au tap (MESSAGE → MessageDetail, ANNOUNCEMENT → AnnouncementDetail, EVENT → EventDetail, INVOICE/PAYMENT → FinanceTab)
- API : [notificationApi.ts](mobile/src/api/notificationApi.ts) avec `registerDeviceToken` qui échoue silencieusement si l'endpoint n'existe pas encore (l'app continue de fonctionner)
- Hook intégré dans `NavigatorBody` du `RootNavigator`

**Architecture**
- Nouveau provider racine `SelectedChildProvider` (uniquement quand authentifié, dans App.tsx)
- Tous les écrans Scolarité partagent l'enfant sélectionné via `useSelectedChild()`

**Qualité**
- `npx tsc --noEmit` passe sans erreur

### ⚠ GAPS BACKEND identifiés (à créer)

Pour que l'app mobile tire pleinement parti du module pédagogique, les endpoints suivants sont à créer côté backend Spring :

1. **`POST /notifications/device-token`** — Enregistrer un token Expo Push avec `{ token, platform: 'ios'|'android' }`
2. **`DELETE /notifications/device-token/{tokenId}`** — Désinscrire un device au logout
3. **Service backend Expo Push** — Pour envoyer effectivement les notifications (utiliser https://exp.host/--/api/v2/push/send avec le token Expo)
4. **`GET /parent/children/{studentId}/devoirs`** — Renvoie les devoirs sans exposer l'ID de classe (sécurité)
5. **`GET /parent/children/{studentId}/schedule`** — Renvoie l'emploi du temps sans exposer l'ID de classe
6. **`GET /parent/children/{studentId}/grades?periodeId=`** — (optionnel) un endpoint consolidé notes+moyennes+rang pour réduire les round-trips

Tant que ces endpoints n'existent pas :
- Les notifications push ne seront pas reçues (mais l'app fonctionne sans)
- Devoirs et Emploi du temps affichent un message explicatif au lieu d'un crash

---

## Session 3 — 2026-04-15 (suite nuit)

### ✅ Réalisé

**Mot de passe oublié (approche pragmatique)**
- [x] Endpoint `POST /auth/forgot-password` ajouté à `authApi`
- [x] [ForgotPasswordScreen](mobile/src/screens/auth/ForgotPasswordScreen.tsx) : saisie email → envoi du lien, écran de confirmation expliquant clairement le flux (l'email contient un lien web qui ouvre la page `/reset-password` du frontend web).
- [x] Route `ForgotPassword` ajoutée au stack racine
- [x] Lien "Mot de passe oublié ?" ajouté sur LoginScreen sous le bouton de connexion
- [x] **Pas d'écran de reset côté mobile** : le backend envoie un lien `https://<frontend>/reset-password?token=…` qui ouvre la page web existante. Le parent réinitialise depuis le navigateur puis revient se connecter dans l'app. Décision prise pour éviter la complexité Universal Links / App Links.

**Services optionnels dynamiques (préinscription)**
- [x] Endpoint `GET /parent/school-services/available` branché via `parentApi.getAvailableServices`
- [x] Type `SchoolService` ajouté
- [x] [PreRegistrationFormScreen](mobile/src/screens/parent/PreRegistrationFormScreen.tsx) : la section "Services optionnels" affiche maintenant la liste réelle des services de l'école (tri par `displayOrder`, exclut `MANDATORY` et `availableAtPreRegistration === false`)
- [x] Fallback automatique : si aucun service n'est configuré côté backend, on retombe sur les checkboxes "Transport / Cantine" précédentes — pas de régression possible
- [x] Sélection multi-services écrite dans `selectedServiceIds` (déjà envoyé au backend dans le payload de création)

**Qualité**
- [x] `npx tsc --noEmit` passe sans erreur

### Note sur le deep linking

Décision : **on ne fait pas de reset côté mobile**. Le lien email pointe sur le frontend web (`https://<frontend>/reset-password?token=…`) qui gère déjà la réinitialisation. Pour basculer vers une expérience full-mobile plus tard, il faudrait soit Universal Links / App Links (lourd), soit modifier la page web `/reset-password` pour proposer un bouton "Ouvrir dans l'app" qui redirige vers `schoolpilot://reset-password?token=…`.

---

## Session 2 — 2026-04-15 (suite nuit)

### ✅ Réalisé

**Inscription parent (self-service)**
- [x] `RegisterScreen` : formulaire complet (prénom, nom, email, téléphone sénégalais validé, mot de passe + confirmation, + CIN/adresse/ville/profession optionnels)
- [x] Endpoint `POST /public/parent/register` branché via `authApi.registerParent`
- [x] `checkEmailAvailability` ajouté (endpoint `GET /public/parent/check-email`) — disponible pour usage futur
- [x] Lien "Créer un compte" ajouté sur `LoginScreen`
- [x] Navigation : `Register` ajoutée au stack racine (visible quand non authentifié)

**Préinscription — création / édition / détail**
- [x] `PreRegistrationFormScreen` : formulaire multi-sections (élève, scolarité, lien parenté, services, médical, commentaires) avec validation — couvre tout le périmètre du formulaire web
- [x] Mode édition : hydratation du form depuis `getPreRegistrationDetails` (l'édition n'est possible que si `canModify`)
- [x] `PreRegistrationDetailScreen` : vue complète avec badges de statut, motif de rejet, notes admin, boutons "Modifier" et "Documents" (conditionnels)
- [x] Endpoints `POST /parent/preregistrations` et `PUT /parent/preregistrations/{id}` branchés
- [x] Bouton "Nouvelle préinscription" ajouté en haut de la liste + dans l'empty state
- [x] Flow liste → détail → documents / édition (au lieu de liste → documents directement)
- [x] Type `PreRegistrationDetail` ajouté dans `types/parent.ts`

**Composants UI supplémentaires**
- [x] `Select` : bouton + modal bottom-sheet avec liste d'options, support description
- [x] `Checkbox` : case + label + description
- [x] `DateField` : wrapper `@react-native-community/datetimepicker` (iOS inline, Android dialog)
- [x] Dépendance ajoutée : `@react-native-community/datetimepicker` + `@react-native-picker/picker`
- [x] Plugin `datetimepicker` configuré dans `app.json`

**Enums hardcodés (mobile-side)**
- [x] `src/config/enums.ts` : `GENDERS`, `PARENT_RELATIONS`, `BLOOD_TYPES`, `DOCUMENT_TYPE_OPTIONS`
- [x] Raison : l'endpoint `/admin/system-parameters` est admin-only. Les valeurs backend (enums Java) sont stables — on les mirror en dur côté mobile, localisés en FR.

**Changement de mot de passe**
- [x] `ChangePasswordScreen` : formulaire avec validation (actuel, nouveau 6+ car., confirmation)
- [x] Endpoint `POST /auth/change-password` ajouté à `authApi.changePassword`
- [x] Entrée ajoutée dans `MoreScreen` (menu "Changer le mot de passe")
- [x] Route `ChangePassword` dans le stack "Plus"

**Qualité**
- [x] `npx tsc --noEmit` passe sans erreur

### Fichiers clés ajoutés cette session

- [src/screens/auth/RegisterScreen.tsx](mobile/src/screens/auth/RegisterScreen.tsx)
- [src/screens/parent/PreRegistrationFormScreen.tsx](mobile/src/screens/parent/PreRegistrationFormScreen.tsx)
- [src/screens/parent/PreRegistrationDetailScreen.tsx](mobile/src/screens/parent/PreRegistrationDetailScreen.tsx)
- [src/screens/parent/ChangePasswordScreen.tsx](mobile/src/screens/parent/ChangePasswordScreen.tsx)
- [src/components/ui/Select.tsx](mobile/src/components/ui/Select.tsx)
- [src/components/ui/Checkbox.tsx](mobile/src/components/ui/Checkbox.tsx)
- [src/components/ui/DateField.tsx](mobile/src/components/ui/DateField.tsx)
- [src/config/enums.ts](mobile/src/config/enums.ts)
- [src/types/preRegistration.ts](mobile/src/types/preRegistration.ts)

---

## Session 1 — 2026-04-15 (nuit)

### ✅ Réalisé

**Fondations**
- [x] Branche `feat/mobile-app-parent` créée depuis `develop`
- [x] Projet Expo bootstrappé avec template `blank-typescript`
- [x] Arborescence propre : `src/{api,components/ui,config,contexts,hooks,navigation,screens/auth,screens/parent,theme,types,utils}`
- [x] Dépendances installées : `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `@tanstack/react-query`, `axios`, `expo-secure-store`, `expo-document-picker`, `expo-file-system`, `expo-sharing`, `expo-image-picker`, `@expo/vector-icons`, `react-hook-form`, `date-fns`
- [x] `app.json` configuré : nom, slug, bundle IDs iOS/Android, `extra.apiBaseUrl`, plugin `expo-secure-store`

**Design system**
- [x] Thème (`src/theme/index.ts`) : palette (primaire #4F46E5), spacing, radius, typography, shadows
- [x] Composants UI réutilisables (`src/components/ui/`) :
  - `Screen` (SafeArea + ScrollView + RefreshControl)
  - `Button` (variants : primary / secondary / ghost / danger, tailles sm/md/lg, loading)
  - `Card`, `Input`, `Badge` (6 tons), `EmptyState`, `Loader`, `ErrorView`, `SectionHeader`

**Couche API**
- [x] Client Axios (`src/api/client.ts`) avec interceptors (Bearer token, 401 handler, extraction message backend)
- [x] `authApi` : login, logout, getCurrentUser, updateProfile
- [x] `parentApi` : dashboard, enfants, préinscriptions, documents (upload/delete multipart), factures, paiements, PDF download, invitations (CRUD), profil, academic-years, levels
- [x] `storage.ts` : wrapper `expo-secure-store` (token, refreshToken, user)
- [x] `download.ts` : téléchargement PDF authentifié + partage natif via `expo-sharing`
- [x] `format.ts` : currency XOF, dates `fr-FR`
- [x] `status.ts` : helpers ton/label pour tous les statuts métier (enfant, préinscription, facture, invitation)

**Auth & Navigation**
- [x] `AuthContext` : login/logout/refresh, restauration session au démarrage, garde sur rôle `PARENT` uniquement
- [x] `QueryProvider` : React Query configuré (staleTime 2 min, retry 1)
- [x] `RootNavigator` : bascule Login / Parent selon `isAuthenticated`
- [x] `ParentTabNavigator` : 5 tabs bas (Accueil / Enfants / Préinscriptions / Finance / Plus) avec icônes Ionicons + stacks dédiées

**Écrans Parent (9/9)**
- [x] `LoginScreen` — email/mot de passe, validation, guard rôle PARENT
- [x] `DashboardScreen` — 4 KPI + 3 derniers enfants + 3 dernières préinscriptions + pull-to-refresh
- [x] `ChildrenListScreen` — liste des enfants avec solde, classe, statut
- [x] `ChildDetailScreen` — détails complets (académique, personnel, médical, transport, responsabilité)
- [x] `PreRegistrationsListScreen` — liste avec statuts, motif de rejet, CTA documents
- [x] `PreRegistrationDocumentsScreen` — upload via `expo-document-picker`, sélection type, notes, liste + suppression
- [x] `FinanceScreen` — tabs Factures / Paiements, summary, téléchargement PDF (factures + reçus) via partage natif
- [x] `InvitationsScreen` — tabs Reçues / Envoyées, envoi, accepter/refuser/annuler
- [x] `ProfileScreen` — lecture profil + formulaire modifiable (téléphone, adresse, ville, profession)
- [x] `MoreScreen` — hub (profil, invitations, déconnexion)

**Qualité**
- [x] `npx tsc --noEmit` passe sans erreur sur l'ensemble du projet

---

## ⏳ Reste à faire

### 🔥 Prochain chantier (demain)

- [ ] **Module Transport** :
  - Endpoints déjà existants côté backend : `/parent-portal/transport/*` (cf section endpoints Session 4)
  - Périmètre suggéré : infos enfant, ligne de bus, arrêts, conducteur, suivi temps réel (ETA + position bus), historique présence transport, paiements transport, notifications transport, signalement absence
  - Décision déjà prise (Session 1) : **pas de carte temps réel Leaflet/MapView** pour la v1 — mais on peut afficher l'ETA + le statut du trajet sans la carte
  - Nouveau tab à intégrer ou écran dans "Plus" — à arbitrer en début de session

### Prioritaire (v1 complète)

- [ ] **Tester sur device réel** (iOS + Android) via Expo Go
- [ ] **Assets graphiques** : icône app, splash screen aux bonnes dimensions
- [ ] **Endpoints backend manquants** (cf section "GAPS BACKEND" Session 4)
- [ ] **Composer un message** côté parent (POST /messages) — actuellement lecture seule
- [ ] **Préférences notifications** (silencieux par catégorie) — endpoint `/notifications/preferences` existe
- [ ] **Gestion erreur réseau globale** : bandeau offline, file d'attente upload
- [ ] **Cohérence auth** : appliquer le hero bleu + icônes Input à Register et ForgotPassword

### Complété en sessions 2 → 5

- [x] ~~Écran Création/Édition de préinscription~~ ✅
- [x] ~~Détail de préinscription~~ ✅
- [x] ~~Changement de mot de passe~~ ✅
- [x] ~~Inscription parent (self-register)~~ ✅
- [x] ~~Mot de passe oublié~~ ✅
- [x] ~~Services optionnels dynamiques~~ ✅
- [x] ~~Communications (annonces + messages, lecture)~~ ✅
- [x] ~~Calendrier / événements~~ ✅
- [x] ~~Scolarité : 5 écrans (ossature avec liste enfants en attente)~~ ✅
- [x] ~~Notifications push (côté mobile)~~ ✅
- [x] ~~Refonte navigation (B)~~ ✅
- [x] ~~Charte Innovation Code (orange + bleu)~~ ✅
- [x] ~~Refonte LoginScreen (hero bleu + carte form + icônes inputs)~~ ✅

### Volontairement retiré du périmètre

- ❌ **Transport temps réel** (bus tracking Leaflet → `react-native-maps` + STOMP WebSocket) — décidé par Balla, session 1

### Nice-to-have (v1.1)

- [ ] Écran détail facture avec historique des paiements liés
- [ ] Messagerie / communications école (endpoints `/communication/*` déjà existants côté backend)
- [ ] Annonces et événements calendrier
- [ ] Mode sombre (dark theme)
- [ ] i18n (actuellement tout en FR hardcodé)

---

## Commandes utiles

```bash
# Depuis d:/Innov'code/school/mobile
npm install            # si besoin de réinstaller
npx expo start         # lancer le dev server (QR code → Expo Go)
npx expo start --tunnel # si le téléphone n'est pas sur le même WiFi
npx tsc --noEmit       # type-check complet
```

### URL backend

- Dev : `http://45.92.111.211:5053` (configurée dans `app.json → extra.apiBaseUrl` et lue via `src/config/env.ts`)
- ⚠️ Sur Android Expo Go, si tu veux pointer un backend `localhost`, utilise l'IP LAN de ta machine — pas `localhost` (le téléphone ne verra pas ton PC).

---

## Points d'attention

1. **Guard rôle PARENT** dans `AuthContext.login` : tout user non-PARENT est rejeté avec message clair. Si plus tard tu veux supporter un autre rôle, modifier là.
2. **`expo-file-system` v19** a changé son API — on utilise `expo-file-system/legacy` dans `src/utils/download.ts`. À migrer vers la nouvelle API quand elle sera stable.
3. **Upload multipart React Native** : la syntaxe `formData.append('file', { uri, name, type })` n'est pas standard web et génère un warning TS (supprimé via `@ts-expect-error`). C'est le pattern officiel RN.
4. **Pas de refresh token automatique** implémenté côté client. Sur 401, l'utilisateur est déconnecté (session claire). À améliorer si le backend émet des tokens courte durée.
5. **Les styles** utilisent `StyleSheet.create` + tokens du thème — éviter les valeurs magiques. Toute nouvelle valeur doit être ajoutée à `src/theme/index.ts`.

---

## Convention pour les prochaines sessions

- Une session = une entrée datée dans la section "Session N" ci-dessus
- Cocher les items de "Reste à faire" au fur et à mesure
- Si un écran est à moitié fait, on le signale explicitement (ne pas le marquer comme fait)
- Tout nouvel endpoint consommé → mettre à jour `parentApi.ts` et les types dans `src/types/parent.ts`

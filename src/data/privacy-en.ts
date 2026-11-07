import type { LegalCopy, TextPart } from './types';
const br: TextPart = { br: 'always' };
const link = (href: string, label: string): TextPart => ({ href, label });
const mail: TextPart = { href: 'mailto:info@therethere.studio', label: 'info@therethere.studio' };

const contactBlock: TextPart[] = [
  'There There Studio (There There)', br,
  'Tsukuba, Ibaraki, Japan', br,
  'Email: ', mail, br,
  'Form: ', link('/#contact', 'Contact'),
];

export const englishPolicies = {
  recorderPrivacy: {
    metaTitle: 'Recorder Ishin privacy policy | There There Studio',
    metaDescription: 'The Recorder Ishin privacy policy. Microphone use, on-device recordings, sharing, backup, and deletion.',
    label: 'Recorder Ishin / Privacy Policy',
    title: 'Privacy policy',
    updated: 'Adopted September 19, 2026. Last updated September 22, 2026.',
    sections: [
      { blocks: [{ p: ['There There (trade name and display name: There There Studio; location: Tsukuba, Ibaraki, Japan; “the studio”) sets out below how information is handled in the iOS app Recorder Ishin (レコーダー維新; “the app”). Checklist Ishin is covered by ', link('/checklist/privacy', 'a separate privacy policy'), '.'] }] },
      { heading: '1. Approach', blocks: [{ p: ['The app is a personal audio recorder. Recording, audio processing, and playback happen on the device. No account is required. The app does not automatically send recordings to the studio’s servers.'] }] },
      { heading: '2. Microphone access', blocks: [
        { p: ['To record and to monitor in real time, the app uses the microphone with your permission. Audio from the microphone is processed on the device, including gain, equalization, and noise reduction. Audio is not sent to the studio or to an outside AI service for processing.'] },
        { p: ['Audio you hear while monitoring is saved as a file when you start a recording. While recording or monitoring is on, the microphone may be used with the screen locked or in the background. Stop it in the app, or turn off microphone access in iOS Settings.'] },
        { p: ['If you turn on voice control for starting and stopping a recording, audio as it comes in is recognized on the device and matched to the keywords you set (the defaults are 「かいし」 and 「しゅうりょう」). Audio and recognition results are not sent to the studio’s servers. Keywords are stored on the device.'] },
      ] },
      { heading: '3. Information stored on the device', blocks: [
        { ul: [
          'Recorded audio files (WAV, ALAC, AAC, and similar formats)',
          'Recording details such as take name, date, duration, format, and file size',
          'App settings such as recording format, AAC quality, and voice-control keywords',
        ] },
        { p: ['This information is stored in the app’s area on the device so the app can record, play, organize, and keep settings. The studio has no way to collect or view it through the app.'] },
      ] },
      { heading: '4. Sharing and backup', blocks: [
        { p: ['When you use Share, the selected recording is passed to the app, service, or person you choose. After that, the recipient’s privacy policy and terms apply.'] },
        { p: ['The app has no cloud sync of its own. Depending on your device and Apple settings, data in the app may be included in an OS backup to iCloud or a computer. That copy follows your settings and the terms of Apple or the other service.'] },
      ] },
      { heading: '5. Advertising, analytics, and tracking', blocks: [
        { p: ['The app does not include a third-party advertising SDK, a behavioral analytics SDK, or a tracking feature that follows you. Recordings and personal information are not sold or provided for advertising.'] },
        { p: ['Diagnostic and usage information from the App Store or the operating system follows Apple’s privacy policy and your device settings.'] },
      ] },
      { heading: '6. Retention and deletion', blocks: [
        { p: ['A recording stays on the device until you delete it. You can delete it from the take list in the app. Deleting the app usually also deletes data stored in the app’s area on that device. Removing the app from the Home Screen is not the same as deleting it.'] },
        { p: ['A file you already shared, or a copy inside an OS backup, is not removed when you delete it in the app. Manage those copies in the destination or in backup settings.'] },
      ] },
      { heading: '7. Contact information', blocks: [{ p: ['Only if you write by email or through the form on this site, the studio receives a reply address, your name, the message, and similar details. They are used to reply, to provide support, and to investigate problems, and they are kept for as long as that work requires. Form messages are received through Google Chat. See ', link('/site-privacy', 'how this site handles personal information'), '.'] }] },
      { heading: '8. Changes', blocks: [{ p: ['If the app’s features or its handling of information change, this policy is updated as needed and the new text is posted on this page.'] }] },
      { heading: '9. Contact', blocks: [{ p: contactBlock }] },
    ],
    backHref: '/recorder',
    backLabel: 'About Recorder Ishin',
    backArrow: true,
  },
  checklistPrivacy: {
    metaTitle: 'Checklist Ishin privacy policy | There There Studio',
    metaDescription: 'The Checklist Ishin privacy policy. On-device speech recognition, photos, local notifications, and how lists and run history are stored and deleted.',
    label: 'Checklist Ishin / Privacy Policy',
    title: 'Privacy policy',
    updated: 'Adopted September 22, 2026. Last updated September 22, 2026.',
    sections: [
      { blocks: [{ p: ['There There (trade name and display name: There There Studio; location: Tsukuba, Ibaraki, Japan; “the studio”) sets out below how information is handled in the iOS app Checklist Ishin (チェックリスト維新; “the app”). Recorder Ishin is covered by ', link('/recorder/privacy', 'a separate privacy policy'), '.'] }] },
      { heading: '1. Approach', blocks: [{ p: ['The app stores repeated procedures on the device and keeps a record of each run. There is no account, no cloud sync, and no connection to the studio’s servers. Lists, photos, audio, and history are not automatically sent to the studio’s servers.'] }] },
      { heading: '2. Microphone and speech recognition', blocks: [
        { p: ['In voice mode, the app uses the microphone and speech recognition, with your permission, to read items aloud and to recognize spoken cues. Speech is synthesized on the device. Recognition is required to run on the device. Audio, recognition results, and the spoken text are not sent to the studio or to an outside AI service.'] },
        { p: ['The initial cues are 「かんりょう」, 「スキップ」, and 「あとで」. You can change the complete and later cues to 1–10 hiragana characters. The default 「スキップ」 can be used as written. 「もう一度」 and 「中断」 are fixed actions. Cues are stored on the device.'] },
        { p: ['Voice mode runs only while the app is in front. Recognition stops while an item is being read and starts again when the reading ends. The microphone does not wait in the background. If microphone or speech-recognition permission is missing, or if on-device recognition is unavailable, you can still run a list with the on-screen controls.'] },
      ] },
      { heading: '3. Camera and photos', blocks: [{ p: ['To attach a photo to a list cover or a checklist item, the app uses the camera or the photo library when you ask it to. The image you choose is stored in the app’s area on the device. The studio has no feature that receives these images.'] }] },
      { heading: '4. Information stored on the device', blocks: [
        { ul: [
          'List title, the situation it is for, items, order, cover image, and item photos',
          'Progress of a run in motion',
          'Run history (start and end time, result, the item text and photos from that run, completed / skipped / held / not yet checked, and whether the action was on screen or by voice)',
          'Notification time and repeat',
          'Voice mode on or off, cues, the completion effect, and haptics',
        ] },
        { p: ['This information is stored in the app’s area on the device so the app can create and run lists, show history, and keep settings. The studio has no way to collect or view it through the app.'] },
        { p: ['A template is a sample bundled with the app. Once you duplicate it, it becomes your list and is stored on the device from then on. Updating a template does not change a list you already duplicated, or any past history.'] },
      ] },
      { heading: '5. Notifications', blocks: [{ p: ['At the daily, weekly, or monthly time you set, the app schedules a local notification on the device. The studio’s servers do not send notifications. The notification text includes the list name, and that text is stored on the device. Permission follows the iOS prompt. You can still run a list from inside the app if notifications are off.'] }] },
      { heading: '6. Backup', blocks: [{ p: ['The app has no cloud sync, export, or share feature of its own. Depending on your device and Apple settings, data in the app may be included in an OS backup to iCloud or a computer. That copy follows your settings and the terms of Apple or the other service.'] }] },
      { heading: '7. Advertising, analytics, and tracking', blocks: [
        { p: ['The app does not include a third-party advertising SDK, a behavioral analytics SDK, or a tracking feature that follows you. Lists, photos, audio, and other personal information are not sold or provided for advertising.'] },
        { p: ['Diagnostic and usage information from the App Store or the operating system follows Apple’s privacy policy and your device settings.'] },
      ] },
      { heading: '8. Retention and deletion', blocks: [
        { p: ['You can delete a list in the app. Deleting a list does not remove earlier run history, or the items and photos kept in that history. “Clear data” in Settings deletes lists, history, a run in progress, scheduled notifications, and settings such as voice cues from the device.'] },
        { p: ['Deleting the app usually also deletes data stored in the app’s area on that device. Removing the app from the Home Screen is not the same as deleting it. A copy inside an OS backup is not removed when you delete data in the app. Manage that copy in backup settings.'] },
      ] },
      { heading: '9. Contact information', blocks: [{ p: ['Only if you write by email or through the form on this site, the studio receives a reply address, your name, the message, and similar details. They are used to reply, to provide support, and to investigate problems, and they are kept for as long as that work requires. Form messages are received through Google Chat. See ', link('/site-privacy', 'how this site handles personal information'), '.'] }] },
      { heading: '10. Changes', blocks: [{ p: ['If the app’s features or its handling of information change, this policy is updated as needed and the new text is posted on this page.'] }] },
      { heading: '11. Contact', blocks: [{ p: contactBlock }] },
    ],
    backHref: '/checklist',
    backLabel: 'About Checklist Ishin',
    backArrow: true,
  },
  sitePrivacy: {
    metaTitle: 'Site privacy | There There Studio',
    metaDescription: 'How There There Studio handles personal information on this website and in the contact form.',
    label: 'Website / Privacy',
    title: 'How this site handles personal information',
    updated: 'Last updated September 22, 2026.',
    sections: [
      { blocks: [{ p: ['There There Studio (operated by There There; location: Tsukuba, Ibaraki, Japan) handles information received through this website and the contact form as follows. Information inside each app follows that app’s own policy. See the ', link('/recorder/privacy', 'Recorder Ishin privacy policy'), ' and the ', link('/checklist/privacy', 'Checklist Ishin privacy policy'), '.'] }] },
      { heading: 'What the contact form receives, and why', blocks: [{ p: ['The form receives your name, email address, shop or company name (optional), topic, and message. This information is used to reply, to respond to a development inquiry, and to support an app or investigate a problem.'] }] },
      { heading: 'Services used', blocks: [{ p: ['The site is delivered and the form is processed with Cloudflare. The message is sent to Google Chat so the studio can read it. These services are used to provide the site and to respond to inquiries. What you submit is not sold or provided for advertising.'] }] },
      { heading: 'Access information and cookies', blocks: [{ p: ['To deliver the site and to limit abuse, Cloudflare may process an IP address, request information, and similar data. The contact rate limit uses the IP address. This site does not use its own advertising or analytics cookies.'] }] },
      { heading: 'Storage', blocks: [{ p: ['Contact information is kept for as long as the reply and the related record require, and it is deleted when it is no longer needed. Access to information received is limited to what the work requires, and the studio takes care to manage it.'] }] },
      { heading: 'Access, correction, and deletion', blocks: [{ p: ['To ask for access to, correction of, or deletion of your own information, email ', mail, '. After confirming it is you, the studio responds as the applicable law requires.'] }] },
      { heading: 'Other sites', blocks: [{ p: ['A linked service applies its own privacy policy. If this notice changes, this page and its “last updated” date are updated.'] }] },
    ],
    backHref: '/#contact',
    backLabel: 'Back to the form',
  },
} satisfies Record<string, LegalCopy>;

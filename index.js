import { reloadCurrentChat, saveSettingsDebounced } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { registerSlashCommand } from '../../../slash-commands.js';
import { isTrueBoolean } from '../../../utils.js';




class Language {
    /**@type {String}*/ name;
    /**@type {Boolean}*/ isCaseSensitive = false;
    /**@type {String[]}*/ keywordList = [];
    /**@type {Boolean}*/ highlightStrings = true;
}
class Settings {
    /**@type {Language[]}*/ languageList = [];
}
/**@type {Settings}*/
const settings = Object.assign(new Settings, extension_settings.customCodeLanguages ?? {});
extension_settings.customCodeLanguages = settings;

const registerLanguage = (lang)=>{
    hljs.registerLanguage('sys', ()=>({
        case_insensitive: !lang.isCaseSensitive,
        keywords: lang.keywordList,
        contains: [
            lang.highlightStrings ? hljs.QUOTE_STRING_MODE : null,
        ].filter(it=>it),
    }));
};


registerSlashCommand('ccl',
    (args, value)=>{
        let lang = settings.languageList.find(it=>it.name.toLowerCase() == args.name.toLowerCase());
        if (!lang) {
            lang = new Language();
            settings.languageList.push(lang);
        }
        lang.name = args.name;
        lang.isCaseSensitive = isTrueBoolean(args.case ?? JSON.stringify(lang.isCaseSensitive));
        lang.keywordList = JSON.parse(value || JSON.stringify(lang.keywordList));
        lang.highlightStrings = isTrueBoolean(args.strings ?? JSON.stringify(lang.highlightStrings));
        hljs.unregisterLanguage(lang.name);
        registerLanguage(lang);
        saveSettingsDebounced();
        reloadCurrentChat();
    },
    [],
    '<span class="monospace">[name=langName] [optional case=true|false] [optional strings=true|false] (["keywords", "for", "the", "language"])</span> – Register a new language (or update an existing one) for codeblocks in chat. <code>case=true</code> to make it case-sensitive. <code>strings=true</code> to highlight quoted text.',
    true,
    true,
);

registerSlashCommand('ccl-list',
    (args, value)=>{
        console.log(settings.languageList);
        toastr.info(JSON.stringify(settings.languageList.map(it=>it.name)));
        return JSON.stringify(settings.languageList);
    },
    [],
    '<span class="monospace"></span> – Output a list of all custom languages.',
    true,
    true,
);

registerSlashCommand('ccl-remove',
    (args, value)=>{
        const idx = settings.languageList.findIndex(it=>it.name.toLowerCase() == value.toLowerCase());
        if (idx != -1) {
            hljs.unregisterLanguage(settings.languageList[idx].name);
            settings.languageList.splice(idx, 1);
            saveSettingsDebounced();
            reloadCurrentChat();
        }
    },
    [],
    '<span class="monospace">(langName)</span> – Delete a custom language.',
    true,
    true,
);



const init = ()=>{
    for (const lang of settings.languageList) {
        registerLanguage(lang);
    }
};
init();

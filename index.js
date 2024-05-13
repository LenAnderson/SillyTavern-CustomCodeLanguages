import { reloadCurrentChat, saveSettingsDebounced } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { registerSlashCommand } from '../../../slash-commands.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
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


SlashCommandParser.addCommandObject(SlashCommand.fromProps({ name: 'ccl',
    callback: (args, value)=>{
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
    namedArgumentList: [
        SlashCommandNamedArgument.fromProps({ name: 'name',
            description: 'name of the language',
            typeList: [ARGUMENT_TYPE.STRING],
            isRequired: true,
        }),
        SlashCommandNamedArgument.fromProps({ name: 'case',
            description: 'whether the keywords are case sensitive or not',
            typeList: [ARGUMENT_TYPE.BOOLEAN],
            defaultValue: 'true',
            enumList: ['true', 'false'],
        }),
        SlashCommandNamedArgument.fromProps({ name: 'strings',
            description: 'whether to highlight quoted text',
            typeList: [ARGUMENT_TYPE.BOOLEAN],
            defaultValue: 'true',
            enumList: ['true', 'false'],
        }),
    ],
    unnamedArgumentList: [
        SlashCommandArgument.fromProps({ description: 'list of keywords to be highlighted',
            typeList: [ARGUMENT_TYPE.LIST],
            isRequired: true,
        }),
    ],
    helpString: 'Register a new language (or update an existing one) for codeblocks in chat. <code>case=true</code> to make it case-sensitive. <code>strings=true</code> to highlight quoted text.',
}));

SlashCommandParser.addCommandObject(SlashCommand.fromProps({ name: 'ccl-list',
    callback: (args, value)=>{
        console.log(settings.languageList);
        toastr.info(JSON.stringify(settings.languageList.map(it=>it.name)));
        return JSON.stringify(settings.languageList);
    },
    helpString: 'Output a list of all custom languages.',
    returns: 'list of custom languages',
}));

SlashCommandParser.addCommandObject(SlashCommand.fromProps({ name: 'ccl-remove',
    callback: (args, value)=>{
        const idx = settings.languageList.findIndex(it=>it.name.toLowerCase() == value.toLowerCase());
        if (idx != -1) {
            hljs.unregisterLanguage(settings.languageList[idx].name);
            settings.languageList.splice(idx, 1);
            saveSettingsDebounced();
            reloadCurrentChat();
        }
    },
    unnamedArgumentList: [
        SlashCommandArgument.fromProps({ description: 'name of the language to remove',
            typeList: [ARGUMENT_TYPE.STRING],
            isRequired: true,
        }),
    ],
    helpString: 'Delete a custom language.',
}));



const init = ()=>{
    for (const lang of settings.languageList) {
        registerLanguage(lang);
    }
};
init();

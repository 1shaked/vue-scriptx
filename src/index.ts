import { App} from 'vue'
class VueScriptPlacer {
    installed = false
    props = {
        src: {
            type: String,
            required: false
        },
        type: {
            type: String,
            default: 'text/javascript'
        },
        crossorigin: {
            type: String,
            required: false
        },
        async: {
            type: Boolean,
            required: false
        },
        scriptLocation: {
            type: String,
            required: false,
            default: 'body',
            validator(val: string): Boolean {
                return ['body', 'head'].indexOf(val) !== -1 
            }
        },
        removeOnUnmount: {
            type: Boolean,
            required: false,
            default: true
        }
    }
    install (app: App): void {
        app.config.globalProperties.$scriptPlacer = this

        const self = this
        if (self.installed) return
        
        app.component('scriptPlacer', {
            props: self.props,
            // Uses render method with <slot>s, see: https://v3.vuejs.org/guide/render-function.html
            template: `
            <template>
                <div :key="reload" style="display: none;">
                    <div :id="elementId" />
                </div>
            </template>`,
            data(){
                return {
                    elementId: 'id' + Math.random().toString(16)
                }
            },
            mounted () {
                const scriptTag: string = 'script'
                const scriptType = 'text/javascript'
                let scriptElement: HTMLElement | null = this?.$el || document.getElementById(this?.elementId)
                const headDocument = document.createElement(scriptTag);
                headDocument.async = this.async || false;
                headDocument.type = this.type || scriptType;
                headDocument.text = this?.$slots?.default() || ''
                if (!!this.src) { // when the src is giving craete this elemnt
                    headDocument.src = this.src;
                }
                if (this.scriptLocation === 'head') { // where to load the script
                    document.head.appendChild(headDocument)
                } else {
                    scriptElement?.parentElement?.appendChild(headDocument)
                }
                this.$nextTick(() => {
                    this.$el.parentElement.removeChild(this.$el)
                    // NOTE: this.$el.remove() may be used, but IE sucks, see: https://github.com/taoeffect/vue-script2/pull/17
                })
            },
            unmounted () { // when component unmonuted remove the script
                if (this.removeOnUnmount) this.$el.parentElement.removeChild(this.$el)
            }
        })
        self.installed = true
    }
}

declare module '@vue/runtime-core' {

    interface ComponentCustomProperties {
        $scriptPlacer: VueScriptPlacer
    }
}

export default new VueScriptPlacer()

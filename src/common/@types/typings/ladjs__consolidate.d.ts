declare module "@ladjs/consolidate"{

  const cons: Consolidate;

  export default cons;

  export type SupportedTemplateEngines =
    | "arc-templates"
    | "atpl"
    | "bracket"
    | "dot"
    | "dust"
    | "eco"
    | "ejs"
    | "ect"
    | "haml"
    | "haml-coffee"
    | "hamlet"
    | "handlebars"
    | "hogan"
    | "htmling"
    | "jade"
    | "jazz"
    | "jqtpl"
    | "just"
    | "liquid"
    | "liquor"
    | "lodash"
    | "marko"
    | "mote"
    | "mustache"
    | "nunjucks"
    | "plates"
    | "pug"
    | "qejs"
    | "ractive"
    | "razor"
    | "react"
    | "slm"
    | "squirrelly"
    | "swig"
    | "teacup"
    | "templayed"
    | "toffee"
    | "twig"
    | "underscore"
    | "vash"
    | "velocityjs"
    | "walrus"
    | "whiskers";

type Requires = SupportedTemplateEngines | "extend" | "ReactDOM" | "babel";

type ConsolidateType = {
  [engine in SupportedTemplateEngines]: RendererInterface;
};

type RequiresType = {
  [engine in Requires]: any;
};

interface Consolidate extends ConsolidateType {
  /**
   * expose the instance of the engine
   */
  requires: RequiresType

  /**
   * Clear the cache.
   *
   * @api public
   */
  clearCache(): void
}

interface RendererInterface {
  render(path: string, function_: (error: Error, html: string) => any): any

  render(
    path: string,
    options: { cache?: boolean | undefined, [otherOptions: string]: any },
    function_: (error: Error, html: string) => any,
  ): any

  render(path: string, options?: { cache?: boolean | undefined, [otherOptions: string]: any }): Promise<string>

  (path: string, function_: (error: Error, html: string) => any): any

  (
    path: string,
    options: { cache?: boolean | undefined, [otherOptions: string]: any },
    function_: (error: Error, html: string) => any,
  ): any

  (path: string, options?: { cache?: boolean | undefined, [otherOptions: string]: any }): Promise<string>
}
}

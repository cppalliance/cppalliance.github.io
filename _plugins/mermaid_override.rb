module Jekyll
  class Mermaid < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
    end

    def render(context)
      "<div class=\"mermaid\">#{super}</div>"
    end
  end
end

Liquid::Template.register_tag('mermaid', Jekyll::Mermaid)

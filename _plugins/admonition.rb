module Jekyll
  class Admonition < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      args = markup.strip.split(' ', 2)
      @type = args[0] || 'note'
      @title = args[1] || default_title(@type)
    end

    def default_title(type)
      case type
      when 'warning' then 'Warning'
      when 'tip' then 'Tip'
      else 'Note'
      end
    end

    def render(context)
      content = super
      site = context.registers[:site]
      converter = site.find_converter_instance(Jekyll::Converters::Markdown)
      rendered = converter.convert(content)
      type_class = @type != 'note' ? " admonition-#{@type}" : ''
      "<div class=\"admonition#{type_class}\">" \
      "<div class=\"admonition-title\">#{@title}</div>" \
      "#{rendered}" \
      "</div>"
    end
  end
end

Liquid::Template.register_tag('admonition', Jekyll::Admonition)

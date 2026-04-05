// i18n.js - Internationalization: English (default) and Portuguese
const i18n = (() => {
  const LANGS = {
    en: {
      // Navigation
      nav_home: 'Home',
      nav_scripts: 'Scripts',
      nav_executors: 'Executors',
      nav_admin: 'Admin',
      nav_logout: 'Sign Out',
      nav_register: 'Register',
      nav_login: 'Sign In',
      nav_user_fallback: 'User',

      // Common
      loading: 'Loading...',
      back_home: 'Back to home',
      free: 'Free',
      paid: 'Paid',
      no_key: 'No Key',
      has_key: 'Has Key',
      third_party: 'Third Party',
      unknown: 'Unknown',
      views: 'views',

      // Time
      time_now: 'just now',
      time_m_ago: '{n}m ago',
      time_h_ago: '{n}h ago',
      time_d_ago: '{n}d ago',

      // Copy
      copied_clipboard: 'Script copied to clipboard',
      copied: 'Script copied',

      // 404 / errors
      page_not_found: 'Page not found',
      page_not_found_desc: "The page you're looking for doesn't exist.",
      go_home: 'Go to home',
      startup_error_hint: 'Make sure the Express server is running with npm run dev and reload.',

      // Home
      home_tagline: 'The largest Roblox scripts hub',
      home_hero_line1: 'Powerful Roblox',
      home_hero_accent: 'Scripts',
      home_hero_line2: ', ready to use',
      home_hero_sub: 'Find, rate and share quality Lua scripts. Community curated, all in one place.',
      home_cta_scripts: 'View all scripts',
      home_cta_executors: 'Executors',
      home_stat_posts: 'Published Scripts',
      home_stat_users: 'Members',
      home_stat_hub: 'Hub Scripts',
      home_recent: 'Recent Scripts',
      home_view_all: 'View all',
      home_empty: 'No scripts published yet.',

      // Scripts page
      scripts_title: 'All Scripts',
      scripts_subtitle: 'Browse the full scripts collection',
      filter_all_sources: 'All sources',
      filter_third_party: 'Third Party',
      filter_with_without_key: 'With or without key',
      filter_no_key: 'No key',
      filter_has_key: 'Has key',
      filter_free_paid: 'Free and paid',
      filter_free_only: 'Free',
      filter_paid_only: 'Paid',
      search_placeholder: 'Search scripts...',
      search_btn: 'Search',
      loading_scripts: 'Loading scripts...',
      no_scripts_found: 'No scripts found',
      no_scripts_hint: 'Try other filters or search terms.',

      // Executors page
      executors_title: 'Executors',
      executors_subtitle: 'List of executors known by the Roblox community. For educational purposes only.',
      executors_warning_title: 'Warning:',
      executors_warning_text: 'The executors listed are third-party tools known by the community. We do not host, distribute, or install any software. Use these tools at your own risk and only on your own accounts.',
      executors_empty: 'No executors registered yet.',

      // Post page
      post_loading: 'Loading script...',
      back_to_scripts: '\u2039 Back to scripts',
      post_by: 'By',
      post_views: 'views',
      post_ratings: 'ratings',
      post_game: 'Game:',
      copy_script: 'Copy Script',
      rating_label: 'Rating',
      votes_label: 'Votes',
      sign_in_to_vote: 'to vote.',
      sign_in_to_rate: 'to rate.',
      sign_in: 'Sign in',
      click_to_rate: 'Click to rate',
      rated_x_of_5: 'Rated {n}/5',
      confirm_delete_post: 'Are you sure you want to delete this post? This action cannot be undone.',
      post_deleted: 'Post deleted successfully',
      status_active: 'Active',
      status_private: 'Private',
      status_draft: 'Draft',
      status_archived: 'Archived',

      // Auth
      login_subtitle: 'Sign in to your account',
      register_subtitle: 'Create your account',
      email_label: 'Email',
      password_label: 'Password',
      login_btn: 'Sign In',
      logging_in: 'Signing in...',
      auth_or: 'or',
      no_account: "Don't have an account?",
      create_account_link: 'Create account',
      username_label: 'Username',
      username_hint: '3-30 chars. Letters, numbers, _ or -.',
      password_hint: 'Minimum 6 characters.',
      confirm_password_label: 'Confirm password',
      register_btn: 'Create Account',
      creating_account: 'Creating account...',
      already_account: 'Already have an account?',
      passwords_no_match: 'Passwords do not match.',
      invalid_username: 'Invalid username. Use only letters, numbers, _ or -.',
      account_created: 'Account created! Check your email to confirm.',

      // Admin – tabs & titles
      admin_title: 'Admin Panel',
      tab_dashboard: 'Dashboard',
      tab_posts: 'Posts',
      tab_users: 'Users',
      tab_editor: 'Post Editor',
      tab_executors: 'Executors',

      // Admin – dashboard
      admin_total_users: 'Total Users',
      admin_total_posts: 'Total Posts',
      admin_top_posts: 'Most Popular Posts',

      // Admin – table headers
      th_title: 'Title',
      th_category: 'Category',
      th_views: 'Views',
      th_likes: 'Likes',
      th_date: 'Date',
      th_tags: 'Tags',
      th_actions: 'Actions',
      th_user: 'User',
      th_role: 'Role',
      th_status: 'Status',
      th_since: 'Since',
      th_name: 'Name',
      th_platform: 'Platform',
      th_price: 'Price',
      th_level: 'Level',
      th_order: 'Order',

      // Admin – posts
      manage_posts: 'Manage Posts',
      new_post: 'New Post',
      confirm_delete_post_admin: 'Delete this post?',
      post_deleted_toast: 'Post deleted.',

      // Admin – users
      manage_users: 'Manage Users',
      banned_label: 'Banned',
      active_label: 'Active',
      ban_btn: 'Ban',
      unban_btn: 'Unban',
      save_role_btn: 'Save',
      confirm_ban: 'Ban this user?',
      confirm_unban: 'Unban this user?',
      role_updated: 'Role updated.',
      status_updated: 'Status updated.',

      // Admin – executors
      manage_executors: 'Manage Executors',
      new_executor: 'New Executor',
      new_executor_title: 'New Executor',
      edit_executor_title: 'Edit Executor',
      executor_name_label: 'Name *',
      executor_name_placeholder: 'e.g.: Solara',
      executor_platform_label: 'Platform',
      executor_platform_placeholder: 'e.g.: Windows / Android',
      executor_price_label: 'Price',
      executor_price_placeholder: 'e.g.: Free',
      executor_level_label: 'Level',
      executor_order_label: 'Display Order',
      executor_description_label: 'Description',
      executor_description_placeholder: 'Executor description...',
      executor_tags_label: 'Tags',
      save_executor: 'Save Executor',
      saving_executor: 'Saving...',
      name_required: 'Name is required.',
      executor_updated: 'Executor updated.',
      executor_created: 'Executor created.',
      executor_deleted: 'Executor deleted.',
      confirm_delete_executor: 'Delete this executor?',

      // Admin – editor
      editor_title_label: 'Title *',
      editor_title_placeholder: 'Script title',
      editor_desc_label: 'Description *',
      editor_desc_placeholder: 'Describe the script...',
      editor_script_label: 'Script (Lua) *',
      editor_script_placeholder: '-- Your Lua script here...',
      editor_game_name: 'Game Name',
      editor_game_name_placeholder: 'e.g.: Blox Fruits',
      editor_version: 'Script Version',
      editor_version_placeholder: 'e.g.: 1.0',
      editor_game_link: 'Game Link (roblox.com)',
      editor_game_link_placeholder: 'https://www.roblox.com/games/...',
      editor_thumbnail: 'Thumbnail',
      editor_thumb_click: 'Click or drag an image',
      editor_thumb_types: 'JPG, PNG, WEBP - max 5MB',
      editor_status: 'Status',
      status_active_label: 'Active (public)',
      status_draft_label: 'Draft (hidden)',
      status_private_label: 'Private',
      status_archived_label: 'Archived',
      editor_source: 'Source',
      editor_has_key: 'Has Key',
      editor_is_paid: 'Is Paid',
      editor_tags: 'Tags',
      tag_placeholder: 'Add tag + Enter',
      tag_hint: 'Press Enter to add (max 10 tags)',
      editor_color: 'Highlight Color',
      publish_btn: 'Publish Post',
      save_changes_btn: 'Save Changes',
      clear_btn: 'Clear',
      saving: 'Saving...',
      post_updated_ok: 'Post updated successfully!',
      post_created_ok: 'Post published successfully!',
      editing_post: 'Editing: "{title}"',
      fill_required: 'Please fill all required fields.',
      error_loading_post: 'Error loading post: ',
      tag_placeholder_executor: 'Add tag + Enter',
      tag_hint_executor: 'Press Enter to add (max 10 tags)',
    },

    pt: {
      // Navigation
      nav_home: 'Inicio',
      nav_scripts: 'Scripts',
      nav_executors: 'Executores',
      nav_admin: 'Admin',
      nav_logout: 'Sair',
      nav_register: 'Registrar',
      nav_login: 'Entrar',
      nav_user_fallback: 'Usuario',

      // Common
      loading: 'Carregando...',
      back_home: 'Voltar ao inicio',
      free: 'Gratuito',
      paid: 'Pago',
      no_key: 'Sem Key',
      has_key: 'Tem Key',
      third_party: 'Terceiros',
      unknown: 'Desconhecido',
      views: 'visualizacoes',

      // Time
      time_now: 'agora',
      time_m_ago: '{n}m atras',
      time_h_ago: '{n}h atras',
      time_d_ago: '{n}d atras',

      // Copy
      copied_clipboard: 'Script copiado para a area de transferencia',
      copied: 'Script copiado',

      // 404 / errors
      page_not_found: 'Pagina nao encontrada',
      page_not_found_desc: 'A pagina que voce procura nao existe.',
      go_home: 'Ir para o inicio',
      startup_error_hint: 'Verifique se o servidor Express esta rodando com npm run dev e recarregue a pagina.',

      // Home
      home_tagline: 'A maior hub de scripts de Roblox',
      home_hero_line1: 'Scripts de Roblox',
      home_hero_accent: 'poderosos',
      home_hero_line2: 'e prontos',
      home_hero_sub: 'Encontre, avalie e compartilhe scripts Lua de qualidade. Curadoria da comunidade, tudo em um so lugar.',
      home_cta_scripts: 'Ver todos os scripts',
      home_cta_executors: 'Executores',
      home_stat_posts: 'Scripts publicados',
      home_stat_users: 'Membros',
      home_stat_hub: 'Scripts da Hub',
      home_recent: 'Scripts Recentes',
      home_view_all: 'Ver todos',
      home_empty: 'Nenhum script publicado ainda.',

      // Scripts page
      scripts_title: 'Todos os Scripts',
      scripts_subtitle: 'Navegue por toda a colecao de scripts',
      filter_all_sources: 'Todas as origens',
      filter_third_party: 'Terceiros',
      filter_with_without_key: 'Com ou sem key',
      filter_no_key: 'Sem key',
      filter_has_key: 'Com key',
      filter_free_paid: 'Gratuitos e pagos',
      filter_free_only: 'Gratuitos',
      filter_paid_only: 'Pagos',
      search_placeholder: 'Buscar scripts...',
      search_btn: 'Buscar',
      loading_scripts: 'Carregando scripts...',
      no_scripts_found: 'Nenhum script encontrado',
      no_scripts_hint: 'Tente outros filtros ou termos de busca.',

      // Executors page
      executors_title: 'Executores',
      executors_subtitle: 'Lista de executores conhecidos pela comunidade Roblox. Informacoes de carater educativo.',
      executors_warning_title: 'Aviso:',
      executors_warning_text: 'Os executores listados sao ferramentas de terceiros conhecidas pela comunidade. Nao hospedamos, distribuimos ou instalamos nenhum software. Use essas ferramentas por sua conta e risco e apenas em contas proprias.',
      executors_empty: 'Nenhum executor cadastrado ainda.',

      // Post page
      post_loading: 'Carregando script...',
      back_to_scripts: '\u2039 Voltar para scripts',
      post_by: 'Por',
      post_views: 'visualizacoes',
      post_ratings: 'avaliacoes',
      post_game: 'Jogo:',
      copy_script: 'Copiar Script',
      rating_label: 'Avaliacao',
      votes_label: 'Votos',
      sign_in_to_vote: 'para votar.',
      sign_in_to_rate: 'para avaliar.',
      sign_in: 'Entre',
      click_to_rate: 'Clique para avaliar',
      rated_x_of_5: 'Avaliou {n}/5',
      confirm_delete_post: 'Deseja realmente excluir este post? Esta acao nao pode ser desfeita.',
      post_deleted: 'Post excluido com sucesso',
      status_active: 'Ativo',
      status_private: 'Privado',
      status_draft: 'Rascunho',
      status_archived: 'Arquivado',

      // Auth
      login_subtitle: 'Entre na sua conta',
      register_subtitle: 'Crie sua conta',
      email_label: 'Email',
      password_label: 'Senha',
      login_btn: 'Entrar',
      logging_in: 'Entrando...',
      auth_or: 'ou',
      no_account: 'Ainda nao tem conta?',
      create_account_link: 'Criar conta',
      username_label: 'Nome de usuario',
      username_hint: '3-30 caracteres. Letras, numeros, _ ou -.',
      password_hint: 'Minimo 6 caracteres.',
      confirm_password_label: 'Confirmar senha',
      register_btn: 'Criar conta',
      creating_account: 'Criando conta...',
      already_account: 'Ja tem conta?',
      passwords_no_match: 'As senhas nao coincidem.',
      invalid_username: 'Nome de usuario invalido. Use apenas letras, numeros, _ ou -.',
      account_created: 'Conta criada! Verifique seu email para confirmar.',

      // Admin – tabs & titles
      admin_title: 'Painel Administrativo',
      tab_dashboard: 'Dashboard',
      tab_posts: 'Posts',
      tab_users: 'Usuarios',
      tab_editor: 'Editor de Post',
      tab_executors: 'Executores',

      // Admin – dashboard
      admin_total_users: 'Total de Usuarios',
      admin_total_posts: 'Total de Posts',
      admin_top_posts: 'Posts Mais Populares',

      // Admin – table headers
      th_title: 'Titulo',
      th_category: 'Categoria',
      th_views: 'Visualizacoes',
      th_likes: 'Curtidas',
      th_date: 'Data',
      th_tags: 'Tags',
      th_actions: 'Acoes',
      th_user: 'Usuario',
      th_role: 'Role',
      th_status: 'Status',
      th_since: 'Desde',
      th_name: 'Nome',
      th_platform: 'Plataforma',
      th_price: 'Preco',
      th_level: 'Level',
      th_order: 'Ordem',

      // Admin – posts
      manage_posts: 'Gerenciar Posts',
      new_post: 'Novo Post',
      confirm_delete_post_admin: 'Excluir este post?',
      post_deleted_toast: 'Post excluido.',

      // Admin – users
      manage_users: 'Gerenciar Usuarios',
      banned_label: 'Banido',
      active_label: 'Ativo',
      ban_btn: 'Banir',
      unban_btn: 'Desbanir',
      save_role_btn: 'Salvar',
      confirm_ban: 'Banir este usuario?',
      confirm_unban: 'Desbanir este usuario?',
      role_updated: 'Role atualizado.',
      status_updated: 'Status atualizado.',

      // Admin – executors
      manage_executors: 'Gerenciar Executores',
      new_executor: 'Novo Executor',
      new_executor_title: 'Novo Executor',
      edit_executor_title: 'Editar Executor',
      executor_name_label: 'Nome *',
      executor_name_placeholder: 'ex: Solara',
      executor_platform_label: 'Plataforma',
      executor_platform_placeholder: 'ex: Windows / Android',
      executor_price_label: 'Preco',
      executor_price_placeholder: 'ex: Gratuito',
      executor_level_label: 'Level',
      executor_order_label: 'Ordem de Exibicao',
      executor_description_label: 'Descricao',
      executor_description_placeholder: 'Descricao do executor...',
      executor_tags_label: 'Tags',
      save_executor: 'Salvar Executor',
      saving_executor: 'Salvando...',
      name_required: 'Nome e obrigatorio.',
      executor_updated: 'Executor atualizado.',
      executor_created: 'Executor criado.',
      executor_deleted: 'Executor excluido.',
      confirm_delete_executor: 'Excluir este executor?',

      // Admin – posts management
      confirm_delete_post_admin: 'Excluir este post?',
      post_deleted_toast: 'Post excluido.',

      // Admin – editor
      editor_title_label: 'Titulo *',
      editor_title_placeholder: 'Titulo do script',
      editor_desc_label: 'Descricao *',
      editor_desc_placeholder: 'Descreva o script...',
      editor_script_label: 'Script (Lua) *',
      editor_script_placeholder: '-- Seu script Lua aqui...',
      editor_game_name: 'Nome do Jogo',
      editor_game_name_placeholder: 'ex: Blox Fruits',
      editor_version: 'Versao do Script',
      editor_version_placeholder: 'ex: 1.0',
      editor_game_link: 'Link do Jogo (roblox.com)',
      editor_game_link_placeholder: 'https://www.roblox.com/games/...',
      editor_thumbnail: 'Thumbnail',
      editor_thumb_click: 'Clique ou arraste uma imagem',
      editor_thumb_types: 'JPG, PNG, WEBP - max 5MB',
      editor_status: 'Status',
      status_active_label: 'Ativo (publico)',
      status_draft_label: 'Rascunho (oculto)',
      status_private_label: 'Privado',
      status_archived_label: 'Arquivado',
      editor_source: 'Origem',
      editor_has_key: 'Tem Key',
      editor_is_paid: 'E Pago',
      editor_tags: 'Tags',
      tag_placeholder: 'Adicionar tag + Enter',
      tag_hint: 'Pressione Enter para adicionar (max 10 tags)',
      editor_color: 'Cor de Destaque',
      publish_btn: 'Publicar Post',
      save_changes_btn: 'Salvar Alteracoes',
      clear_btn: 'Limpar',
      saving: 'Salvando...',
      post_updated_ok: 'Post atualizado com sucesso!',
      post_created_ok: 'Post publicado com sucesso!',
      editing_post: 'Editando: "{title}"',
      fill_required: 'Preencha todos os campos obrigatorios.',
      error_loading_post: 'Erro ao carregar post: ',
      tag_placeholder_executor: 'Adicionar tag + Enter',
      tag_hint_executor: 'Pressione Enter para adicionar (max 10 tags)',
    }
  };

  let _lang = localStorage.getItem('lang') || 'en';

  function t(key, params) {
    const dict = LANGS[_lang] || LANGS['en'];
    let str = dict[key] !== undefined ? dict[key] : (LANGS['en'][key] !== undefined ? LANGS['en'][key] : key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.split(`{${k}}`).join(String(v));
      });
    }
    return str;
  }

  function setLang(lang) {
    if (!LANGS[lang]) return;
    _lang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  function getLang() { return _lang; }

  return { t, setLang, getLang };
})();

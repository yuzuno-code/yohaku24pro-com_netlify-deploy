document.addEventListener('DOMContentLoaded', () => {

  // ========================================
  // ヘッダー：スクロール時に .is-scrolled を付与
  // ========================================
  const header = document.querySelector('.l-header');
  let menuIsOpen = false; // ハンバーガーメニュー開閉中のis-scrolled誤発火防止フラグ
  if (header) {
    const onScroll = () => {
      if (menuIsOpen) return; // メニュー操作中はスクロール判定をスキップ
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // 初期状態を即時反映
  }

  // ========================================
  // ハンバーガーメニュー（SP用）
  // ========================================
  const nav = document.querySelector('.c-nav');
  const hamburger = document.querySelector('.js-hamburger');
  const navLinks = document.querySelector('.c-nav__links');

  if (hamburger && nav) {
    let savedScrollY = 0;
    let menuCloseTimer = null; // ヘッダー背景フェードアウトのタイマー

    const openMenu = () => {
      menuIsOpen = true;
      if (menuCloseTimer) { clearTimeout(menuCloseTimer); menuCloseTimer = null; }
      nav.classList.add('is-open');
      if (header) header.classList.add('is-menu-open');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'メニューを閉じる');
      // iOS Safari でも背面スクロールを止める
      savedScrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.width = '100%';
    };
    const closeMenu = () => {
      nav.classList.remove('is-open');
      // オーバーレイ（0.5s）が閉じ終わる直前にヘッダー背景フェードを開始
      menuCloseTimer = setTimeout(() => {
        if (header) header.classList.remove('is-menu-open');
        menuCloseTimer = null;
      }, 450);
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'メニューを開く');
      // position:fixed 解除と同時にスクロール位置を復元（Safari でのジャンプ防止）
      const restoreY = -parseInt(document.body.style.top || '0', 10);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      if (header) header.classList.toggle('is-scrolled', restoreY > 20); // 復元後の正しい状態を即時セット
      menuIsOpen = false;
      window.scrollTo({ top: restoreY, behavior: 'instant' }); // scroll-behavior:smooth を無効化して瞬時に復元
    };

    hamburger.addEventListener('click', () => {
      nav.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    // メニューリンクをクリックしたらメニューを閉じる
    if (navLinks) {
      navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
      });
    }

    // PC幅になったらメニューを強制クローズ
    window.matchMedia('(min-width: 1000px)').addEventListener('change', (e) => {
      if (e.matches) closeMenu();
    });
  }

  // ========================================
  // Hero：ページ読み込み後に .is-loaded を付与（フェードイン）
  // ========================================
  const hero = document.querySelector('.p-hero');
  const heroScroll = document.querySelector('.p-hero__scroll');
  if (hero) {
    requestAnimationFrame(() => {
      hero.classList.add('is-loaded');
      if (heroScroll) heroScroll.classList.add('is-visible');
    });
  }

  // ========================================
  // スムーズスクロール（data-target 属性を持つボタン）
  // ========================================
  document.querySelectorAll('.js-scroll-to').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const header = document.querySelector('.l-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const top = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ========================================
  // スクロールフェードイン（.js-reveal クラスを持つ要素）
  // ========================================
  const revealEls = document.querySelectorAll('.js-reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // ========================================
  // ポートレイト：マウスパラレックス
  // ========================================
  const portrait = document.querySelector('.p-hero__portrait');
  if (portrait) {
    window.addEventListener('mousemove', (e) => {
      const px = (e.clientX - window.innerWidth / 2) / 60;
      const py = (e.clientY - window.innerHeight / 2) / 60;
      portrait.style.transform = `translate(${px * 0.8}px, ${py * 0.8}px)`;
    }, { passive: true });
  }

  // ========================================
  // カスタムカーソル（dot + ring）
  // ========================================
  // タッチデバイスでは表示しない
  if (window.matchMedia('(pointer: fine)').matches) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed; width: 10px; height: 10px; border-radius: 50%;
      background: #d65a32; pointer-events: none; z-index: 10000;
      mix-blend-mode: multiply; transform: translate(-50%, -50%);
      transition: opacity 0.2s; opacity: 0;
    `;
    const ring = document.createElement('div');
    ring.style.cssText = `
      position: fixed; width: 36px; height: 36px; border-radius: 50%;
      border: 1px solid #d65a32; pointer-events: none; z-index: 10000;
      transform: translate(-50%, -50%); opacity: 0;
      transition: transform 0.25s cubic-bezier(0.2,0.8,0.2,1), opacity 0.2s, width 0.2s, height 0.2s;
      mix-blend-mode: multiply;
    `;
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
      dot.style.opacity = '0.85'; ring.style.opacity = '0.5';
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      dot.style.opacity = '0'; ring.style.opacity = '0';
    });

    window.addEventListener('mousedown', () => {
      ring.style.transform = 'translate(-50%, -50%) scale(0.7)';
    });

    window.addEventListener('mouseup', () => {
      ring.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    // タブ切り替えや別ウィンドウへの遷移時にカーソルを隠す・リセット
    const hideCursor = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      ring.style.transform = 'translate(-50%, -50%) scale(1)'; // mousedown状態をリセット
    };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) hideCursor();
    });
    window.addEventListener('blur', hideCursor);

    // ringは慣性を持って遅れて追従
    const tick = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(tick);
    };
    tick();
  }

  // ========================================
  // タブ切り替え・別ウィンドウ遷移時のフォーカス解除（focus-visible残留防止）& hover無効化
  // ========================================
  const clearFocus = () => {
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearFocus();
      document.documentElement.classList.remove('is-hoverable');
    }
  });
  window.addEventListener('blur', () => {
    clearFocus();
    document.documentElement.classList.remove('is-hoverable');
  });

  // マウスが動いたら hover を有効化（pointer: fine デバイスのみ）
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', () => {
      document.documentElement.classList.add('is-hoverable');
    }, { passive: true });
  }

  // ========================================
  // CTA：パラレックスblob
  // ========================================
  const ctaBlob = document.querySelector('.p-cta__blob');
  const ctaSection = document.querySelector('.p-cta');
  if (ctaBlob && ctaSection) {
    // 固定値4500はSPで縦積みになると実際のCTAのtop位置と大きくずれるため動的に取得
    let ctaOffsetTop = ctaSection.offsetTop;
    const updateCtaBlob = () => {
      ctaBlob.style.transform = `translateY(${(window.scrollY - ctaOffsetTop) * -0.08}px)`;
    };
    // transformを設定してから表示（CSS visibility:hidden → リロード時に一瞬表示される問題を防ぐ）
    updateCtaBlob();
    ctaBlob.style.visibility = 'visible';
    window.addEventListener('scroll', updateCtaBlob, { passive: true });
    // リサイズ時にオフセット位置を再計算
    window.addEventListener('resize', () => {
      ctaOffsetTop = ctaSection.offsetTop;
      updateCtaBlob();
    });
  }

  // ========================================
  // Strengths：パラレックスblob
  // ========================================
  const strengthsBlob = document.querySelector('.p-strengths__blob');
  if (strengthsBlob) {
    window.addEventListener('scroll', () => {
      strengthsBlob.style.transform = `translateY(${(window.scrollY - 2000) * -0.06}px)`;
    }, { passive: true });
  }

  // ========================================
  // FAQ：アコーディオン（scrollHeight で動的に max-height を設定）
  // ========================================
  const faqItems = document.querySelectorAll('.p-faq__item');
  if (faqItems.length) {
    const openPanel = (item) => {
      const panel = item.querySelector('.p-faq__panel');
      item.classList.add('is-open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    };
    const closePanel = (item) => {
      const panel = item.querySelector('.p-faq__panel');
      item.classList.remove('is-open');
      panel.style.maxHeight = '0';
    };

    // 初期状態：トランジションを一時的に無効化して即時描画
    faqItems.forEach((item) => {
      const panel = item.querySelector('.p-faq__panel');
      panel.style.transition = 'none';
      if (item.classList.contains('is-open')) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = '0';
      }
    });

    // 次フレームでトランジションを元に戻す
    requestAnimationFrame(() => {
      faqItems.forEach((item) => {
        item.querySelector('.p-faq__panel').style.transition = '';
      });
    });

    faqItems.forEach((item) => {
      const btn = item.querySelector('.p-faq__btn');
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        faqItems.forEach(el => closePanel(el));
        if (!isOpen) openPanel(item);
      });
    });
  }

  // ========================================
  // Services：PCのみカードのアクティブ状態を管理
  // ========================================
  if (window.matchMedia('(hover: hover)').matches) {
    const serviceCards = document.querySelectorAll('.p-services__card');
    if (serviceCards.length) {
      serviceCards[0].classList.add('is-active');
      serviceCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          serviceCards.forEach(c => c.classList.remove('is-active'));
          card.classList.add('is-active');
        });
      });
    }
  }

});

// Main Frontend Interactive Scripts

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // 2. User Dropdown Menu Toggle
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userMenu = document.getElementById('user-dropdown');

  if (userMenuBtn && userMenu) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      if (!userMenu.classList.contains('hidden')) {
        userMenu.classList.add('hidden');
      }
    });
  }

  // 3. Auto-dismiss alerts after 5 seconds
  const flashAlerts = document.querySelectorAll('.flash-alert');
  flashAlerts.forEach((alert) => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-10px)';
      setTimeout(() => alert.remove(), 500);
    }, 5000);
  });

  // 4. Quick View Modal Handlers
  const quickViewModal = document.getElementById('quick-view-modal');
  const quickViewButtons = document.querySelectorAll('.quick-view-btn');
  const quickViewCloseBtn = document.getElementById('quick-view-close');

  if (quickViewModal) {
    const modalImage = document.getElementById('qv-image');
    const modalCategory = document.getElementById('qv-category');
    const modalTitle = document.getElementById('qv-title');
    const modalAuthor = document.getElementById('qv-author');
    const modalRating = document.getElementById('qv-rating');
    const modalRatingCount = document.getElementById('qv-rating-count');
    const modalPrice = document.getElementById('qv-price');
    const modalDiscount = document.getElementById('qv-discount');
    const modalDescription = document.getElementById('qv-description');
    const modalStock = document.getElementById('qv-stock');
    const modalBookId = document.getElementById('qv-book-id');
    const modalDetailLink = document.getElementById('qv-detail-link');

    quickViewButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const bookId = button.dataset.bookId;
        if (!bookId) return;

        try {
          const res = await fetch(`/api/books/${bookId}/quick-view`);
          const data = await res.json();

          if (data.success && data.book) {
            const b = data.book;
            if (modalImage) modalImage.src = b.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80';
            if (modalCategory) modalCategory.textContent = b.category_name || 'General';
            if (modalTitle) modalTitle.textContent = b.title;
            if (modalAuthor) modalAuthor.textContent = `By ${b.author}`;
            if (modalRating) modalRating.textContent = b.rating || '4.5';
            if (modalRatingCount) modalRatingCount.textContent = `(${b.rating_count || 10} reviews)`;
            if (modalDescription) modalDescription.textContent = b.description;
            if (modalBookId) modalBookId.value = b.id;
            if (modalDetailLink) modalDetailLink.href = `/books/${b.id}`;

            if (modalPrice) {
              if (b.discount_price) {
                modalPrice.textContent = `$${parseFloat(b.discount_price).toFixed(2)}`;
                if (modalDiscount) {
                  modalDiscount.textContent = `$${parseFloat(b.price).toFixed(2)}`;
                  modalDiscount.classList.remove('hidden');
                }
              } else {
                modalPrice.textContent = `$${parseFloat(b.price).toFixed(2)}`;
                if (modalDiscount) modalDiscount.classList.add('hidden');
              }
            }

            if (modalStock) {
              if (b.stock_quantity > 0) {
                modalStock.textContent = `In Stock (${b.stock_quantity} copies)`;
                modalStock.className = 'text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block';
              } else {
                modalStock.textContent = 'Out of Stock';
                modalStock.className = 'text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded inline-block';
              }
            }

            quickViewModal.classList.remove('hidden');
            quickViewModal.classList.add('flex');
          }
        } catch (err) {
          console.error('Failed to load book quick view', err);
        }
      });
    });

    if (quickViewCloseBtn) {
      quickViewCloseBtn.addEventListener('click', () => {
        quickViewModal.classList.add('hidden');
        quickViewModal.classList.remove('flex');
      });
    }

    // Close modal on backdrop click
    quickViewModal.addEventListener('click', (e) => {
      if (e.target === quickViewModal) {
        quickViewModal.classList.add('hidden');
        quickViewModal.classList.remove('flex');
      }
    });
  }

  // 5. Password Show/Hide Toggle
  const togglePasswordButtons = document.querySelectorAll('.toggle-password-btn');
  togglePasswordButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      const icon = btn.querySelector('i');

      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
          }
        } else {
          input.type = 'password';
          if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
          }
        }
      }
    });
  });
});

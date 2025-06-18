from sklearn.decomposition import PCA
def generate_pca(ax,n_components:int, data, dimensions:list, labels: list):
    pca = PCA(n_components=n_components)
    clim_pca = pca.fit_transform(data)
    for i in range(len(clim_pca)):
        color = f'C{labels[i]}' if labels[i] >= 0 else 'gray'
        ax.scatter(clim_pca[i, dimensions[0]], clim_pca[i, dimensions[1]], c=color, s=40)
    ax.set_title('Clustering Jerárquico (PCA Climatológico)')
    ax.set_xlabel('PC1')
    ax.set_ylabel('PC2')
    ax.grid(True)
    return ax, pca
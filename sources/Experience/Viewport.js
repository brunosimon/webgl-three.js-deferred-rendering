export default class Viewport
{
    constructor(_options)
    {
        this.domElement = _options.domElement
        this.width = null
        this.height = null
        this.smallestSide = null
        this.biggestSide = null
        this.pixelRatio = null
        this.clampedPixelRatio = null
        this.vertical = null

        const bounding = this.domElement.getBoundingClientRect()
        this.elementWidth = bounding.width
        this.elementHeight = bounding.height

        this.resize()
    }

    resize()
    {
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.smallestSide = this.width < this.height ? this.width : this.height
        this.biggestSide = this.width > this.height ? this.width : this.height
        this.pixelRatio = window.devicePixelRatio
        this.clampedPixelRatio = Math.min(this.pixelRatio, 2)
        this.vertical = this.width / this.height < 0.8

        if(this.vertical)
            document.documentElement.classList.add('is-vertical')
        else
            document.documentElement.classList.remove('is-vertical')

        const bounding = this.domElement.getBoundingClientRect()
        this.elementWidth = bounding.width
        this.elementHeight = bounding.height
    }
}